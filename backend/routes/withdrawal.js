import express from 'express';
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const withdrawalRouter = express.Router();

// Member Withdrawal Route
withdrawalRouter.post('/all', (req, res) => {
    const { member_id, amount, withdrawal_method } = req.body;

    if (!member_id || !amount || !withdrawal_method) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const transaction_id = uuidv4(); 

    const sql = `INSERT INTO withdrawals (member_id, amount, withdrawal_method, transaction_id) 
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [member_id, amount, withdrawal_method, transaction_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            message: 'Withdrawal successful',
            transaction_id
        });
    });
});

withdrawalRouter.get('/all', (req, res) => {
    const sql = 'SELECT * FROM withdrawals';

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json(results);
    });
});


export default withdrawalRouter;
