import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from '../config/db.js'; // Postgres pool
import validator from 'validator';

dotenv.config();
const paymentRouter = express.Router();

// ======= ENV VARIABLES =======
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

  try {
    const result = await pool.query('SELECT id FROM members WHERE phone = $1', [phone]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, toast: true, message: 'Member not found.' });
    }

    const memberId = result.rows[0].id;
    const token = await getMpesaToken();

    // Safaricom timestamp format YYYYMMDDHHMMSS
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
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const checkoutId = data.CheckoutRequestID;

    await pool.query(
      'INSERT INTO payments (member_id, phone, amount, status, transaction, date_paid) VALUES ($1, $2, $3, $4, $5, NOW())',
      [memberId, phone, amount, 'pending', checkoutId]
    );

    res.status(200).json({
      success: true,
      toast: true,
      message: '📲 Payment initiated. Enter your M-Pesa PIN.',
      transaction_id: checkoutId,
    });
  } catch (error) {
    console.error('[STK Push Error]', error.response?.data || error.message);
    res.status(500).json({ success: false, toast: true, message: 'STK Push failed. Please try again.' });
  }
});

// ======= M-PESA CALLBACK =======
paymentRouter.post('/mpesa/webhook', express.json(), async (req, res) => {
  const data = req.body;
  console.log('[MPESA CALLBACK RECEIVED]', JSON.stringify(data, null, 2));

  const stkCallback = data?.Body?.stkCallback;
  if (!stkCallback) {
    return res.status(400).json({ message: 'Invalid callback payload.' });
  }

  const transactionId = stkCallback.CheckoutRequestID;
  const resultCode = stkCallback.ResultCode;

  // Map result codes
  let status = 'pending';
  if (resultCode === 0) status = 'success';
  else if (resultCode === 1032) status = 'cancelled';
  else status = 'failed';

  // Extract receipt if available
  let receipt = null;
  if (status === 'success' && stkCallback.CallbackMetadata) {
    const receiptObj = stkCallback.CallbackMetadata.Item.find(
      (item) => item.Name === 'MpesaReceiptNumber'
    );
    if (receiptObj) receipt = receiptObj.Value;
  }

  try {
    await pool.query(
      'UPDATE payments SET status = $1, receipt = $3, updated_at = NOW() WHERE transaction = $2',
      [status, transactionId, receipt]
    );

    // If success, update member balances
    if (status === 'success') {
      const paymentResult = await pool.query(
        'SELECT member_id, amount FROM payments WHERE transaction = $1',
        [transactionId]
      );

      if (paymentResult.rows.length) {
        const { member_id, amount } = paymentResult.rows[0];
        const memberResult = await pool.query('SELECT total_paid FROM members WHERE id = $1', [member_id]);

        if (memberResult.rows.length) {
          const totalPaid = parseFloat(memberResult.rows[0].total_paid || 0) + parseFloat(amount);
          const required = 50000;
          let balance = required - totalPaid;
          let extra = 0;

          if (balance < 0) {
            extra = Math.abs(balance);
            balance = 0;
          }

          await pool.query(
            'UPDATE members SET total_paid = $1, balance = $2, extra_paid = $3, payment_status = $4 WHERE id = $5',
            [totalPaid, balance, extra, 'completed', member_id]
          );
        }
      }
    }

    console.log(`[M-Pesa] Transaction ${transactionId} → ${status} ${receipt ? `Receipt: ${receipt}` : ''}`);
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('Webhook DB error:', err);
    res.status(500).json({ message: 'Error updating payment status.' });
  }
});

// ======= PAYMENT STATUS CHECK =======
paymentRouter.get('/mpesa/status/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  try {
    const result = await pool.query('SELECT status FROM payments WHERE transaction = $1', [transactionId]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: '❌ Transaction not found.' });
    }

    const status = result.rows[0].status;
    let message;

    switch (status) {
      case 'success':
        message = '✅ Payment successful 🎉';
        break;
      case 'failed':
        message = '❌ Payment failed. Please try again.';
        break;
      case 'cancelled':
        message = '⚠️ Payment was cancelled.';
        break;
      case 'pending':
      default:
        message = '⏳ Payment is still pending...';
        break;
    }

    res.json({ success: true, status, message });
  } catch (err) {
    console.error('[Status Check Error]', err);
    res.status(500).json({ success: false, message: '⚠️ Error checking payment status.' });
  }
});

// ======= GET ALL PAYMENTS =======
paymentRouter.get('/mpesa/pay', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT amount, phone, status, receipt, transaction, date_paid FROM payments ORDER BY date_paid DESC'
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'No payments found.' });
    }
    res.status(200).json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching payments.' });
  }
});

// ======= COUNT PAYMENTS =======
paymentRouter.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_payments FROM payments');
    res.json({ success: true, total: result.rows[0].total_payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error counting payments.' });
  }
});

// ======= MANUAL PAYMENT =======
paymentRouter.post('/payment/manual', async (req, res) => {
  const { memberId, amount } = req.body;

  if (!memberId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid member ID or amount.' });
  }

  try {
    const memberResult = await pool.query('SELECT total_paid, phone FROM members WHERE id = $1', [memberId]);
    if (!memberResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const currentTotal = parseFloat(memberResult.rows[0].total_paid || 0);
    const newTotal = currentTotal + parseFloat(amount);
    const phone = memberResult.rows[0].phone;

    const required = 50000;
    let balance = required - newTotal;
    let extra = 0;

    if (balance < 0) {
      extra = Math.abs(balance);
      balance = 0;
    }

    await pool.query(
      'UPDATE members SET total_paid = $1, balance = $2, extra_paid = $3, payment_status = $4, date = NOW() WHERE id = $5',
      [newTotal, balance, extra, 'completed', memberId]
    );

    await pool.query(
      'INSERT INTO payments (member_id, phone, amount, status, transaction, date_paid) VALUES ($1, $2, $3, $4, $5, NOW())',
      [memberId, phone, amount, 'success', 'manual']
    );

    res.status(200).json({
      success: true,
      message: '💳 Manual payment recorded successfully.',
      total_paid: newTotal,
      balance,
      extra_paid: extra,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing manual payment.' });
  }
});

export default paymentRouter;
