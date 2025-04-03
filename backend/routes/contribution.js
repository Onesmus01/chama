import express from 'express';
import db from '../config/db.js';

const contributionRouter = express.Router();

contributionRouter.post('/api/contributions', (req, res) => {
    const { member_id, amount, payment_method, transaction_id } = req.body;

    if (!member_id || !amount || !payment_method || !transaction_id) {
        return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    const sql = `
        INSERT INTO contributions (member_id, amount, payment_method, transaction_id)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [member_id, amount, payment_method, transaction_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ success: true, msg: 'Contribution recorded successfully' });
    });
});

export default contributionRouter;
