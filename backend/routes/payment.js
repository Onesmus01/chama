import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import db from '../config/db.js';
import validator from 'validator';

dotenv.config();

const paymentRouter = express.Router();

// Sanitize input
const sanitizeInput = (input) => validator.escape(String(input).trim());

// Environment variables
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

// 🔐 Get M-Pesa Access Token
const getMpesaToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

// 💸 Initiate Payment (STK Push)
paymentRouter.post('/mpesa/pay', async (req, res) => {
  const phone = sanitizeInput(req.body.phone);
  const amount = parseFloat(req.body.amount);

  if (!validator.isMobilePhone(phone, 'any') || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, toast: true, message: 'Invalid phone number or amount.' });
  }

  db.query('SELECT id FROM members WHERE phone = ?', [phone], async (err, results) => {
    if (err) return res.status(500).json({ success: false, toast: true, message: 'Database error when finding member.' });

    if (results.length === 0) {
      return res.status(404).json({ success: false, toast: true, message: 'Member not found.' });
    }

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const checkoutId = data.CheckoutRequestID;

      const insertQuery = `
        INSERT INTO payments (member_id, phone, amount, status, transaction, date_paid)
        VALUES (?, ?, ?, 'pending', ?, NOW())
      `;

      db.query(insertQuery, [memberId, phone, amount, checkoutId], (err) => {
        if (err) {
          console.error('Error saving payment:', err);
          return res.status(500).json({ success: false, toast: true, message: 'Error saving payment.' });
        }

        res.json({
          success: true,
          toast: true,
          message: 'Payment initiated. Enter your M-Pesa PIN.',
          transaction_id: checkoutId,
        });
      });
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, toast: true, message: 'STK Push failed. Please try again.' });
    }
  });
});

// 🔁 M-Pesa Callback Webhook
paymentRouter.post('/mpesa/webhook', (req, res) => {
  let data;

  try {
    // Parse raw buffer to JSON
    data = JSON.parse(req.body.toString());
  } catch (err) {
    console.error('❌ Failed to parse webhook JSON:', err);
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  console.log('🔔 Incoming Callback:', JSON.stringify(data, null, 2));

  const { stkCallback } = data?.Body || {};

  if (!stkCallback) {
    return res.status(400).json({ message: 'Invalid callback payload.' });
  }

  const transactionId = stkCallback.CheckoutRequestID;
  const resultCode = stkCallback.ResultCode;
  const status = resultCode === 0 ? 'success' : 'failed';

  db.query(
    'UPDATE payments SET status = ?, updated_at = NOW() WHERE transaction = ?',
    [status, transactionId],
    (err) => {
      if (err) {
        console.error('❌ Webhook DB update error:', err);
        return res.status(500).json({ message: 'Error updating payment status.' });
      }

      console.log(`✅ Payment ${transactionId} updated to "${status}"`);
      res.json({ message: 'Webhook received' });
    }
  );
});


// 🔍 Poll payment status by transaction ID
paymentRouter.get('/mpesa/status/:transactionId', (req, res) => {
  const { transactionId } = req.params;

  db.query('SELECT status FROM payments WHERE transaction = ?', [transactionId], (err, results) => {
    if (err) {
      console.error('Status check error:', err);
      return res.status(500).json({ success: false, message: 'Error checking status.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.json({ success: true, status: results[0].status });
  });
});

// 📊 Count total payments
paymentRouter.get('/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total_payments FROM payments', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error counting payments.' });
    res.json({ success: true, total: results[0].total_payments });
  });
});

// 📋 Get all payments
paymentRouter.get('/mpesa/pay', (req, res) => {
  const query = 'SELECT name, amount, phone, status, transaction, date_paid FROM payments';
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching payments.' });
    res.json(Array.isArray(result) ? result : { success: true, payments: result });
  });
});

export default paymentRouter;
