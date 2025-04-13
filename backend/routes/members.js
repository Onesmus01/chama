import express from 'express';
import mysql from 'mysql';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import multer from 'multer'
import {authorize} from '../middleware/authorize.js'


dotenv.config(); 

const router = express.Router();
// ✔ Register Member
router.post('/register', async (req, res) => {
    console.log("Incoming request body:", req.body);

    const { name, email, phone, password, role = "member" } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    // Validate phone number format
    const phoneRegex = /^(254\d{9}|07\d{8})$/;

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, msg: 'Phone number must start with 254 and be exactly 12 digits long' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, msg: 'Password should be at least 6 characters long' });
    }

    try {
        // Check if email or phone already exists
        const checkQuery = `SELECT * FROM members WHERE email = ? OR phone = ?`;
        db.query(checkQuery, [email, phone], async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.length > 0) {
                return res.status(400).json({ success: false, msg: 'Email or phone number already in use' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new member
            const insertQuery = `INSERT INTO members (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`;

            db.query(insertQuery, [name, email, phone, hashedPassword, role], (err, result) => {
                if (err) {
                    console.error("Insert error:", err);
                    return res.status(500).json({ error: err.message });
                }

                // Generate JWT token
                const token = jwt.sign({ email, role }, process.env.SECRET_KEY, { expiresIn: '1d' });

                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000
                });

                res.status(201).json({ message: '✅ Member registered successfully', token });
            });
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Error hashing password' });
    }
});

// ✔ Login Member
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = `SELECT id, name, email, phone, password, role FROM members WHERE email = ?`; // Role added

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const member = results[0];

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT Token with role
        const token = jwt.sign(
            { id: member.id, email: member.email, role: member.role },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({
            message: 'Login successful',
            member: {
                id: member.id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                role: member.role, // Role included in response
            },
            token,
        });
    });
});

//single member
router.get('/:id', (req, res) => {
    const memberId = req.params.id;
    
    const sql = `
        SELECT 
            m.id AS member_id,
            m.name,
            m.email,
            m.phone,
            m.created_at AS member_since,
            c.id AS contribution_id,
            c.amount,
            c.payment_method,
            c.transaction_id,
            c.payment_date
        FROM members m
        LEFT JOIN contributions c ON m.id = c.member_id
        WHERE m.id = ?;
    `;

    db.query(sql, [memberId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Member not found" });
        }

        res.json(results);
    });
});

//delete member
router.delete('/:id/delete', (req, res) => {
    const { id } = req.params;
    
    const sql = `DELETE FROM members WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, message: 'Member deleted successfully' });
    });
});
 
//update member
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const sql = `UPDATE members SET name = ?, email = ?, phone = ? WHERE id = ?`;

    db.query(sql, [name, email, phone, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, message: 'Member updated successfully' });
    });
});

//printing pdf 
router.get('/pdf', (req, res) => {
    const sql = `
        SELECT 
            c.id AS contribution_id,
            m.name AS member_name,
            m.email AS member_email,
            m.phone AS member_phone,
            c.amount,
            c.payment_method,
            c.transaction_id,
            c.payment_date
        FROM contributions c
        JOIN members m ON c.member_id = m.id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ message: "No payments found" });
        }

        // Create a PDF Document
        const doc = new PDFDocument();
        const filePath = './payments_report.pdf';
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // PDF Title
        doc.fontSize(20).text('Payments Report', { align: 'center' });
        doc.moveDown();

        // Table Header
        doc.fontSize(12).text('ID | Name | Email | Phone | Amount | Method | Transaction ID | Date', { underline: true });
        doc.moveDown();

        // Loop Through Data
        results.forEach((row) => {
            doc.text(`${row.contribution_id} | ${row.member_name} | ${row.member_email} | ${row.member_phone} | ${row.amount} | ${row.payment_method} | ${row.transaction_id} | ${row.payment_date}`);
            doc.moveDown();
        });

        // End PDF
        doc.end();

        // Send PDF as response
        writeStream.on('finish', () => {
            res.download(filePath, 'payments_report.pdf', (err) => {
                if (err) console.log(err);
                fs.unlinkSync(filePath); // Delete after download
            });
        });
    });
});

//all members
// Endpoint to fetch all members and their payment status

router.get('/all/all_members', (req, res) => {
    const sql = `SELECT * FROM members`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Compute payment status for each member
        const updatedMembers = results.map(member => {
            let payment_status = 'pending';

            if (member.amount === 50000) {
                payment_status = 'completed';
            } else if (member.amount < 50000) {
                payment_status = 'balance';
            } else if (member.amount > 50000) {
                payment_status = 'bonus';
            }

            return {
                id: member.id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                amount: member.amount,
                role: member.role,
                payment_status, // dynamically set
                created_at: member.created_at,
                date: member.date
            };
        });

        // Respond with updated members
        res.status(200).json({
            success: true,
            members: updatedMembers
        });
    });
});


router.get("/count", (req, res) => {
    db.query("SELECT COUNT(*) AS total_members FROM members", (err, rows) => {
        if (err) return res.status(500).json({ error: "Server error" });
        res.json(rows[0]);
    });
});

//profile image
const upload = multer({ storage: multer.memoryStorage() });


// Upload profile picture to Cloudinary
router.put('/:id/profile', upload.single('profile_picture'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const result = await cloudinary.v2.uploader.upload_stream({ folder: 'profiles' }, (error, uploadedImage) => {
            if (error) return res.status(500).json({ error: 'Upload failed' });

            const sql = `UPDATE members SET profile_picture = ? WHERE id = ?`;
            db.query(sql, [uploadedImage.secure_url, req.params.id], (err, dbResult) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Profile updated', profile_picture: uploadedImage.secure_url });
            });
        }).end(req.file.buffer);
    } catch (err) {
        res.status(500).json({ error: 'Upload error' });
    }
});


router.put('/updating/:id/updated', (req, res) => {
    const { name, phone, date } = req.body;
    const memberId = req.params.id;

    console.log("Request body:", req.body); // Log the data received

    if (!name || !phone || !date) {
        return res.status(400).json({ success: false, message: 'All fields (name, phone, date) are required' });
    }

    const sql = `UPDATE members SET name = ?, phone = ?, date = ? WHERE id = ?`;

    db.query(sql, [name, phone, date, memberId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, message: 'Member updated successfully' });
    });
});

export default router;
