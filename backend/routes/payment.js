import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import db from '../config/db.js'; 

dotenv.config();
const paymentRouter = express.Router();

// Get M-Pesa Access Token
const getMpesaToken = async () => {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching M-Pesa token:', error);
        throw new Error('Failed to get M-Pesa token');
    }
};

// STK Push Payment Route
paymentRouter.post('/mpesa', async (req, res) => {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ success: false, message: 'Phone, amount, and member ID are required' });
    }

    try {
        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
        const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: phone,
                CallBackURL: process.env.CALLBACK_URL,
                AccountReference: 'Chama Payment',
                TransactionDesc: 'Chama Membership Payment'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const sql = `INSERT INTO payments ( phone, amount, status, transaction_id, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())`;
        const values = [ phone, amount, 'pending', response.data.CheckoutRequestID];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error saving transaction:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, message: 'STK Push request sent', transaction_id: response.data.CheckoutRequestID });
            console.log('transaction successful')
        }); 

    } catch (error) {
        console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'M-Pesa payment failed' });
    }
});
paymentRouter.get("/count", (req, res) => {
    db.query("SELECT COUNT(*) AS total_payments FROM payments", (err, results) => {
      if (err) {
        console.error("Error fetching payment count:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ total: results[0].total_payments });
    });
  });
  

export default paymentRouter;
