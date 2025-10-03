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
  WEBHOOK_SECRET,   // 🔒 Protect webhook
  MPESA_ENV,        // "sandbox" or "production"
} = process.env;

if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY || !CALLBACK_URL) {
  throw new Error('Missing required M-Pesa environment variables.');
}

// ======= ENV-BASED ENDPOINTS =======
const BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// ======= INPUT SANITIZER =======
const sanitizeInput = (input) => validator.escape(String(input).trim());

// ======= TOKEN CACHING =======
let cachedToken = null;
let tokenExpiry = null;

const getMpesaToken = async () => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    console.log('[TOKEN] Using cached token ✅');
    return cachedToken;
  }

  console.log('[TOKEN] Requesting new token from Safaricom...');
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  cachedToken = data.access_token;
  tokenExpiry = now + 3500 * 1000; // ~58 min
  console.log('[TOKEN] New token received ✅');
  return cachedToken;
};

// ======= INITIATE PAYMENT =======
// ======= INITIATE PAYMENT =======
paymentRouter.post('/mpesa/pay', async (req, res) => {
  const phone = sanitizeInput(req.body.phone);
  const amount = parseFloat(req.body.amount);

  if (!validator.isMobilePhone(phone, 'any') || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, toast: true, message: 'Invalid phone number or amount.' });
  }

  try {
    // Check if member exists
    const result = await pool.query('SELECT id FROM members WHERE phone = $1', [phone]);
    const memberId = result.rows.length ? result.rows[0].id : null; // <-- memberId is null if not found

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const { data } = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
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
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const checkoutId = data.CheckoutRequestID;

    // Insert payment record; member_id may be null
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
  } catch (err) {
    console.error('[STK Push Error]', err.response?.data || err.message);
    res.status(500).json({ success: false, toast: true, message: 'STK Push failed. Please try again.' });
  }
});


// ======= M-PESA CALLBACK =======
paymentRouter.post('/mpesa/webhook', express.json(), async (req, res) => {
  // 🔒 Verify secret if set
  if (WEBHOOK_SECRET && req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) {
    return res.status(403).json({ message: 'Unauthorized webhook' });
  }

  const data = req.body;
  console.log('[CALLBACK] Full payload:', JSON.stringify(data, null, 2));

  const stkCallback = data?.Body?.stkCallback;
  if (!stkCallback) {
    return res.status(400).json({ message: 'Invalid callback payload.' });
  }

  const transactionId = stkCallback.CheckoutRequestID;
  const resultCode = stkCallback.ResultCode;
  const status = resultCode === 0 ? 'success' : 'failed';

  console.log(`[CALLBACK] Transaction: ${transactionId}, ResultCode: ${resultCode}, Status: ${status}`);

  try {
    // Log callback for auditing (stringify payload)
    await pool.query(
      'INSERT INTO mpesa_logs (transaction_id, status, payload) VALUES ($1, $2, $3)',
      [transactionId, status, JSON.stringify(data)]
    );

    // Update payment status
    await pool.query(
      'UPDATE payments SET status = $1, updated_at = NOW() WHERE transaction = $2',
      [status, transactionId]
    );

    if (status === 'success') {
      const paymentResult = await pool.query(
        'SELECT member_id, amount FROM payments WHERE transaction = $1',
        [transactionId]
      );

      if (paymentResult.rows.length) {
        const { member_id, amount } = paymentResult.rows[0];
        const memberResult = await pool.query('SELECT total_paid, expected_contribution FROM members WHERE id = $1', [member_id]);

        if (memberResult.rows.length) {
          const totalPaid = parseFloat(memberResult.rows[0].total_paid || 0) + parseFloat(amount);
          const expectedContribution = parseFloat(memberResult.rows[0].expected_contribution || 0);
          let balance = expectedContribution - totalPaid;
          let extra = 0;

          if (balance < 0) {
            extra = Math.abs(balance);
            balance = 0;
          }

          await pool.query(
            'UPDATE members SET total_paid = $1, balance = $2, extra_paid = $3, payment_status = $4 WHERE id = $5',
            [totalPaid, balance, extra, balance === 0 ? 'completed' : 'pending', member_id]
          );

          console.log(`[CALLBACK] Member ${member_id} updated. totalPaid=${totalPaid}, balance=${balance}, extra=${extra}`);
        }
      }
    }

    console.log(`[CALLBACK] Transaction ${transactionId} marked as "${status}" ✅`);
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
    console.log(`[STATUS] Transaction ${transactionId} current status: ${status}`);

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
      'SELECT amount, phone, status, transaction, date_paid FROM payments ORDER BY date_paid DESC'
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'No payments found.' });
    }
    console.log(`[PAYMENTS] Returning ${result.rows.length} payment records`);
    res.status(200).json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching payments.' });
  }
});

// ======= COUNT PAYMENTS =======
paymentRouter.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_payments FROM payments');
    console.log(`[COUNT] Total payments: ${result.rows[0].total_payments}`);
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
    const memberResult = await pool.query(
      'SELECT total_paid, phone, expected_contribution FROM members WHERE id = $1',
      [memberId]
    );

    if (!memberResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const currentTotal = parseFloat(memberResult.rows[0].total_paid || 0);
    const expectedContribution = parseFloat(memberResult.rows[0].expected_contribution || 0);
    const phone = memberResult.rows[0].phone;
    const newTotal = currentTotal + parseFloat(amount);

    let balance = expectedContribution - newTotal;
    let extra = 0;
    if (balance < 0) {
      extra = Math.abs(balance);
      balance = 0;
    }

    await pool.query(
      'UPDATE members SET total_paid = $1, balance = $2, extra_paid = $3, payment_status = $4 WHERE id = $5',
      [newTotal, balance, extra, balance === 0 ? 'completed' : 'pending', memberId]
    );

    const transactionRef = `manual-${Date.now()}`;
    await pool.query(
      'INSERT INTO payments (member_id, phone, amount, status, transaction, date_paid) VALUES ($1, $2, $3, $4, $5, NOW())',
      [memberId, phone, amount, 'success', transactionRef]
    );

    console.log(`[MANUAL] Member ${memberId} manual payment recorded. Amount=${amount}, newTotal=${newTotal}, Ref=${transactionRef}`);

    res.status(200).json({
      success: true,
      message: '💳 Manual payment recorded successfully.',
      total_paid: newTotal,
      balance,
      extra_paid: extra,
      transaction: transactionRef,
    });
  } catch (err) {
    console.error("❌ Manual payment error:", err);
    res.status(500).json({ success: false, message: 'Error processing manual payment.' });
  }
});

export default paymentRouter;
