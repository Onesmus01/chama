import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from '../config/db.js'; // Postgres pool
import validator from 'validator';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import transporter from "../config/nodemailer.js";


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
  EMAIL_USER,
  EMAIL_PASS
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

// ======= EMAIL SETUP =======


const sendPaymentEmail = async (memberEmail, memberName, amount, transactionId) => {
  try {
    // Generate PDF receipt
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      // Send email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: memberEmail,
        subject: 'Payment Confirmation - Chama',
        text: `Hello ${memberName},\n\nYour payment of KES ${amount} has been received. Transaction ID: ${transactionId}\n\nThank you for using Chama!`,
        attachments: [
          {
            filename: `Receipt-${transactionId}.pdf`,
            content: pdfData,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Payment receipt sent to ${memberEmail}`);
    });

    doc.fontSize(20).text('Chama Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Hello ${memberName},`);
    doc.text(`We have received your payment successfully.`);
    doc.text(`Amount: KES ${amount}`);
    doc.text(`Transaction ID: ${transactionId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.text('Thank you for being a part of Chama!');//fine
    doc.end();
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
  }
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
    const memberId = result.rows.length ? result.rows[0].id : null;

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
  // 🔐 Verify webhook secret
  if (WEBHOOK_SECRET && req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) {
    console.warn('[CALLBACK] ❌ Unauthorized webhook request');
    return res.status(403).json({ message: 'Unauthorized webhook' });
  }

  const data = req.body;
  console.log('\n[CALLBACK] ===== NEW WEBHOOK RECEIVED =====');
  console.log('[CALLBACK] Full Payload:', JSON.stringify(data, null, 2));

  const stkCallback = data?.Body?.stkCallback;
  if (!stkCallback) {
    console.error('[CALLBACK] ❌ Missing stkCallback in payload');
    return res.status(400).json({ message: 'Invalid callback payload.' });
  }

  // ✅ IDs
  const merchantRequestId = stkCallback.MerchantRequestID;
  const checkoutRequestId = stkCallback.CheckoutRequestID;
  const resultCode = stkCallback.ResultCode;

  // 🔹 Map ResultCode → Status
  let status = 'pending';
  if (resultCode === 0) {
    status = 'success';
  } else if (resultCode === 1032) {
    status = 'cancelled'; // User cancelled prompt
  } else if ([1, 1037, 2001, 2002].includes(resultCode)) {
    status = 'failed'; // Timeout, insufficient funds, expired, etc.
  } else {
    status = 'failed'; // Unknown code fallback
  }

  console.log(`[CALLBACK] 🔎 IDs: Merchant=${merchantRequestId}, Checkout=${checkoutRequestId}`);
  console.log(`[CALLBACK] 🔎 ResultCode=${resultCode}, Mapped Status="${status}"`);

  try {
    // 🔹 Always log payload to mpesa_logs
    await pool.query(
      'INSERT INTO mpesa_logs (transaction_id, status, payload) VALUES ($1, $2, $3)',
      [checkoutRequestId, status, JSON.stringify(data)]
    );
    console.log('[CALLBACK] 📝 Logged to mpesa_logs table');

    // 🔹 Update payments
    const updateResult = await pool.query(
      `UPDATE payments 
       SET status = $1, updated_at = NOW() 
       WHERE transaction = $2 OR checkout_id = $3`,
      [status, merchantRequestId, checkoutRequestId]
    );

    if (updateResult.rowCount === 0) {
      console.warn(`[CALLBACK] ⚠️ No matching payment found for Merchant=${merchantRequestId} OR Checkout=${checkoutRequestId}`);
    } else {
      console.log(`[CALLBACK] 📝 Payment row updated (${updateResult.rowCount} row(s))`);
    }

    // 🔹 Only update member balances if payment success
    if (status === 'success') {
      const paymentResult = await pool.query(
        'SELECT member_id, amount FROM payments WHERE transaction = $1 OR checkout_id = $2',
        [merchantRequestId, checkoutRequestId]
      );

      if (!paymentResult.rows.length) {
        console.warn(`[CALLBACK] ⚠️ No payment row found for updating member`);
      } else {
        const { member_id, amount } = paymentResult.rows[0];
        console.log(`[CALLBACK] 💰 Payment found: Member=${member_id}, Amount=${amount}`);

        const memberResult = await pool.query(
          'SELECT total_paid, expected_contribution, name, email FROM members WHERE id = $1',
          [member_id]
        );

        if (!memberResult.rows.length) {
          console.warn(`[CALLBACK] ⚠️ Member ${member_id} not found`);
        } else {
          const member = memberResult.rows[0];
          const totalPaid = parseFloat(member.total_paid || 0) + parseFloat(amount);
          const expectedContribution = parseFloat(member.expected_contribution || 0);
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

          console.log(`[CALLBACK] ✅ Member ${member_id} updated. totalPaid=${totalPaid}, balance=${balance}, extra=${extra}`);

          // 📧 Email receipt
          await sendPaymentEmail(member.email, member.name, amount, checkoutRequestId);
          console.log(`[CALLBACK] 📧 Receipt sent to ${member.email}`);
        }
      }
    } else {
      console.log(`[CALLBACK] 🚫 Member update skipped because status="${status}"`);
    }

    console.log(`[CALLBACK] ✅ Webhook processed successfully for Checkout=${checkoutRequestId}`);
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('[CALLBACK] ❌ Webhook DB error:', err);
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
      'SELECT total_paid, phone, expected_contribution, name, email FROM members WHERE id = $1',
      [memberId]
    );

    if (!memberResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const currentTotal = parseFloat(memberResult.rows[0].total_paid || 0);
    const expectedContribution = parseFloat(memberResult.rows[0].expected_contribution || 0);
    const phone = memberResult.rows[0].phone;
    const memberName = memberResult.rows[0].name;
    const memberEmail = memberResult.rows[0].email;
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

    // SEND EMAIL + PDF RECEIPT
    await sendPaymentEmail(memberEmail, memberName, amount, transactionRef);

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
