import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import db from '../config/db.js';
import validator from 'validator';

dotenv.config();
const paymentRouter = express.Router();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_URL,
} = process.env;

if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY || !CALLBACK_URL) {
  throw new Error('Missing required M-Pesa environment variables.');
}

const sanitizeInput = (input) => validator.escape(String(input).trim());

// ======= ACCESS TOKEN =======
const getMpesaToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return data.access_token;
};

// ======= INITIATE PAYMENT =======
paymentRouter.post('/mpesa/pay', async (req, res) => {
  const phone = sanitizeInput(req.body.phone);
  const amount = parseFloat(req.body.amount);

  if (!validator.isMobilePhone(phone, 'any') || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, toast: true, message: 'Invalid phone number or amount.' });
  }

  db.query('SELECT id FROM members WHERE phone = ?', [phone], async (err, results) => {
    if (err) return res.status(500).json({ success: false, toast: true, message: 'Database error.' });
    if (!results.length) return res.status(404).json({ success: false, toast: true, message: 'Member not found.' });

    const memberId = results[0].id;

    try {
      const token = await getMpesaToken();
      const timestamp = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
      const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

      const { data } = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: phone,
          PartyB: MPESA_SHORTCODE,
          PhoneNumber: phone,
          CallBackURL: CALLBACK_URL,
          AccountReference: 'Chama Payment',
          TransactionDesc: 'Chama Membership Payment',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const checkoutId = data.CheckoutRequestID;

      db.query(
        'INSERT INTO payments (member_id, phone, amount, status, transaction, date_paid) VALUES (?, ?, ?, ?, ?, NOW())',
        [memberId, phone, amount, 'pending', checkoutId],
        (err) => {
          if (err) return res.status(500).json({ success: false, toast: true, message: 'Error saving payment.' });

          res.status(200).json({
            success: true,
            toast: true,
            message: 'Payment initiated. Enter your M-Pesa PIN.',
            transaction_id: checkoutId,
          });
        }
      );
    } catch (error) {
      console.error('[STK Push Error]', error.response?.data || error.message);
      res.status(500).json({ success: false, toast: true, message: 'STK Push failed. Please try again.' });
    }
  });
});

// ======= M-PESA CALLBACK =======
paymentRouter.post('/mpesa/webhook', express.text({ type: '*/*' }), (req, res) => {
  let data;
  try {
    data = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  const stkCallback = data?.Body?.stkCallback;
  if (!stkCallback) return res.status(400).json({ message: 'Invalid callback payload.' });

  const transactionId = stkCallback.CheckoutRequestID;
  const resultCode = stkCallback.ResultCode;
  const status = resultCode === 0 ? 'success' : 'failed';

  db.query(
    'UPDATE payments SET status = ?, updated_at = NOW() WHERE transaction = ?',
    [status, transactionId],
    (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).json({ message: 'Error updating payment status.' });
      }

      if (status === 'success') {
        db.query(
          `SELECT member_id, amount FROM payments WHERE transaction = ?`,
          [transactionId],
          (err, results) => {
            if (err || !results.length) return;

            const { member_id, amount } = results[0];

            db.query('SELECT total_paid FROM members WHERE id = ?', [member_id], (err, results) => {
              if (err || !results.length) return;

              const totalPaid = parseFloat(results[0].total_paid || 0) + parseFloat(amount);
              const required = 50000;
              let balance = required - totalPaid;
              let extra = 0;

              if (balance < 0) {
                extra = Math.abs(balance);
                balance = 0;
              }

              db.query(
                'UPDATE members SET total_paid = ?, balance = ?, extra_paid = ?, payment_status = "completed" WHERE id = ?',
                [totalPaid, balance, extra, member_id]
              );
            });
          }
        );
      }

      console.log(`[M-Pesa] Transaction ${transactionId} marked as "${status}"`);
      res.status(200).json({ message: 'Webhook processed successfully' });
    }
  );
});

// ======= PAYMENT STATUS CHECK =======
paymentRouter.get('/mpesa/status/:transactionId', (req, res) => {
  const { transactionId } = req.params;

  db.query('SELECT status FROM payments WHERE transaction = ?', [transactionId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error checking status.' });
    if (!results.length) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    res.json({ success: true, status: results[0].status });
  });
});

// ======= GET ALL PAYMENTS =======
paymentRouter.get('/mpesa/pay', (req, res) => {
  const query = `SELECT amount, phone, status, transaction, date_paid FROM payments ORDER BY date_paid DESC`;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching payments.' });

    if (!Array.isArray(result) || !result.length) {
      return res.status(404).json({ success: false, message: 'No payments found.' });
    }

    res.status(200).json({ success: true, payments: result });
  });
});

// ======= COUNT PAYMENTS =======
paymentRouter.get('/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total_payments FROM payments', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error counting payments.' });

    res.json({ success: true, total: results[0].total_payments });
  });
});

// ======= MANUAL PAYMENT =======
paymentRouter.post('/payment/manual', (req, res) => {
  const { memberId, amount } = req.body;

  if (!memberId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid member ID or amount.' });
  }

  db.query('SELECT total_paid, phone FROM members WHERE id = ?', [memberId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching member.' });
    if (!results.length) return res.status(404).json({ success: false, message: 'Member not found.' });

    const currentTotal = parseFloat(results[0].total_paid || 0);
    const newTotal = currentTotal + parseFloat(amount);
    const phone = results[0].phone;
    const required = 50000;

    let balance = required - newTotal;
    let extra = 0;

    if (balance < 0) {
      extra = Math.abs(balance);
      balance = 0;
    }

    db.query(
      'UPDATE members SET total_paid = ?, balance = ?, extra_paid = ?, payment_status = "completed", date = NOW() WHERE id = ?',
      [newTotal, balance, extra, memberId],
      (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Error updating member payment.' });

        db.query(
          'INSERT INTO payments (member_id, phone, amount, status, transaction, date_paid) VALUES (?, ?, ?, ?, ?, NOW())',
          [memberId, phone, amount, 'success', 'manual'],
          (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Error recording payment.' });

            res.status(200).json({
              success: true,
              message: 'Manual payment recorded successfully.',
              total_paid: newTotal,
              balance,
              extra_paid: extra,
            });
          }
        );
      }
    );
  });
});

export default paymentRouter;
