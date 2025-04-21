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
import {verifyAdmin} from '../middleware/verifyAdmin.js'


dotenv.config(); 

const router = express.Router();

// backend/utils/sendEmail.js
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,    // e.g. your_email@gmail.com
        pass: process.env.EMAIL_PASS,    // Gmail app password, NOT your actual password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email sending error:", err);
    throw err;
  }
};



// ✔ Register Member
import nodemailer from "nodemailer";

// Create a transporter to send emails using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com", // 🔒 your Gmail
        pass: "your-app-password"     // 🔒 app password from Google
    },
});

// Function to send a welcome email to the new member
const sendWelcomeEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: "Chamapay 🏠 <your-email@gmail.com>",
        to: userEmail,
        subject: "🎉 Welcome to Chamapay!",
        html: `
            <h2 style="color: #4CAF50;">Welcome to Chamapay, ${userName}!</h2>
            <p>We're thrilled to have you onboard. You are now officially a member of <strong>Chamapay</strong> – your trusted system for seamless rental property management and payments.</p>
            <p>Here’s what you can do:</p>
            <ul>
                <li>🏠 Browse and rent property easily</li>
                <li>💳 Pay securely from anywhere</li>
                <li>📊 View rent history and receipts</li>
                <li>⚙️ Enjoy a smooth, member-friendly dashboard</li>
            </ul>
            <p>If you need help, feel free to reach out. We’re always here for you!</p>
            <p style="margin-top: 20px;">Warm regards,<br />The Chamapay Team 💚</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// Function to send a notification email to all other users
const sendNewMemberNotificationEmail = async (newMemberName) => {
    // Query to get all users from the database except the new member
    const query = 'SELECT email, name FROM members WHERE email != ?';
    db.query(query, [newMemberEmail], async (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            return;
        }

        // Send email to all other users
        for (const user of result) {
            const mailOptions = {
                from: "Chamapay 🏠 onesmuswambua747@gmail.com",
                to: user.email,
                subject: `🎉 New Member Joined Chamapay!`,
                html: `
                    <h2 style="color: #4CAF50;">Exciting News: New Member Joined Chamapay!</h2>
                    <p>We are excited to announce that <strong>${newMemberName}</strong> has joined Chamapay!</p>
                    <p>Let’s all welcome them to the community. Together, we’ll continue to build a better platform for rental property management and payments.</p>
                    <p>Stay tuned for more updates!</p>
                    <p style="margin-top: 20px;">Warm regards,<br />The Chamapay Team 💚</p>
                `,
            };

            await transporter.sendMail(mailOptions);
        }
    });
};

router.post('/register', async (req, res) => {
    console.log("Incoming request body:", req.body);
    const { name, email, phone, password, role = "member" } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    const phoneRegex = /^(254\d{9}|07\d{8})$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            msg: 'Phone number must start with 254 and be exactly 12 digits long'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            msg: 'Password should be at least 6 characters long'
        });
    }

    try {
        const checkQuery = `SELECT * FROM members WHERE email = ? OR phone = ?`;
        db.query(checkQuery, [email, phone], async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    success: false,
                    msg: 'Email or phone number already in use'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = `INSERT INTO members (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`;

            db.query(insertQuery, [name, email, phone, hashedPassword, role], async (err, result) => {
                if (err) {
                    console.error("Insert error:", err);
                    return res.status(500).json({ error: err.message });
                }

                const newMemberId = result.insertId;
                const token = jwt.sign(
                    { id: newMemberId, email, role },
                    process.env.SECRET_KEY,
                    { expiresIn: '7d' }
                );

                // ✅ Send welcome email to the new member
                try {
                    await sendWelcomeEmail(email, name);
                } catch (emailErr) {
                    console.error("Email sending failed:", emailErr.message);
                }

                // ✅ Send notification email to all other users
                try {
                    await sendNewMemberNotificationEmail(name);
                } catch (notificationErr) {
                    console.error("Notification email sending failed:", notificationErr.message);
                }

                // ✅ Set token in cookie
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                });

                // ✅ Set token in response headers
                res.setHeader('Authorization', `Bearer ${token}`);

                return res.status(201).json({
                    success: true,
                    message: '✅ Member registered successfully',
                    token
                });
            });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Error hashing password' });
    }
});


// LOGIN MEMBER
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("📥 Incoming login request:", req.body);

    if (!email || !password) {
        return res.status(400).json({ success: false, msg: 'Email and password are required' });
    }

    try {
        const sql = `SELECT id, name, email, phone, password, role FROM members WHERE email = ?`;
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ success: false, msg: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, msg: 'Invalid email or password' });
            }

            const member = results[0];
            const isMatch = await bcrypt.compare(password, member.password);

            if (!isMatch) {
                return res.status(401).json({ success: false, msg: 'Invalid email or password' });
            }

            const payload = {
                id: member.id,
                email: member.email,
                role: member.role,
            };

            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });

            // ✅ Set token in cookie
            res.cookie('authToken', token, {
                httpOnly: true,       // prevents JavaScript access (XSS protection)
                secure: true,         // only sent over HTTPS
                sameSite: 'Strict',   // prevents CSRF from other sites (use 'Lax' if you need cross-site)
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
            

            // ✅ Set token in header (for localStorage)
            res.setHeader('Authorization', `Bearer ${token}`);

            console.log("✅ Login successful. Token set in cookie and header.");

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                member: {
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    phone: member.phone,
                    role: member.role,
                },
                token,
            });
        });
    } catch (error) {
        console.error("🚨 Login error:", error);
        return res.status(500).json({ success: false, msg: 'Login failed. Please try again.' });
    }
});

// RESET PASSWORD
router.post("/forgot/reset-password", (req, res) => {
    const { email } = req.body;
  
    db.query("SELECT * FROM members WHERE email = ?", [email], async (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ msg: "Server error", error: err.message });
      }
  
      if (result.length === 0) {
        return res.status(400).json({ msg: "User not found" });
      }
  
      const user = result[0];
      const resetToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "10m",
      });
  
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
      const message = `Reset your password using this link: ${resetUrl}`;
  
      try {
        await sendEmail(email, "Reset Your Password", message);
        res.status(200).json({ message: "Reset link sent to email" });
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
        res.status(500).json({ msg: "Failed to send email", error: emailErr.message });
      }
    });
  });
  

//single member
router.get('/saved/save/saving', authorize(['member', 'admin']), (req, res) => {
    console.log("🔍 Member object:", req.member);

    const memberId = req.member?.id;

    if (!memberId) {
        return res.status(401).json({ message: "Unauthorized. No member ID found." });
    }

    const sql = `
        SELECT 
            m.id AS member_id,
            m.name,
            m.email,
            m.phone,
            m.total_paid,
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
            return res.status(404).json({ message: "Member not found." });
        }

        const memberInfo = {
            name: results[0].name,
            email: results[0].email,
            phone: results[0].phone,
            total_paid: results[0].total_paid, // ✅ Add this line
            member_since: results[0].member_since,
        };

        const savings = results
            .filter(entry => entry.amount !== null)
            .map(entry => ({
                amount: entry.amount,
                payment_method: entry.payment_method,
                transaction_id: entry.transaction_id,
                payment_date: entry.payment_date,
            }));

        // Check if total_paid is 0 and return the message accordingly
        if (results[0].total_paid === 0) {
            return res.status(200).json({
                ...memberInfo,
                savings: [],
                message: "You have not contributed yet."
            });
        }

        // If savings exist, send the response
        res.json({ ...memberInfo, savings });
    });
});


router.get("/transact/transactions", authorize(['member','admin']), (req, res) => {
    const memberId = req.member?.id;  // Using req.member.id

    const sql = `
        SELECT date_paid, amount, status,transaction
        FROM payments
        WHERE member_id = ?
    `;

    db.query(sql, [memberId], (err, results) => {
        if (err) {
            console.error('❌ Database query error:', err);  // Log the error for better debugging
            return res.status(500).json({ message: "❌ Database query error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No transactions found for this member." });
        }

        res.json(results);
    });
});

//delete member
router.delete('/:id/delete',verifyAdmin, (req, res) => {
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
router.put('/:id',verifyAdmin, (req, res) => {
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

//
router.put('/updating/:id/updated', (req, res) => {
    const { name, phone, date } = req.body;
    const memberId = req.params.id;

    // Log the incoming request data
    console.log("Request body:", req.body); // Logs the data received in the request body
    console.log("Member ID:", memberId); // Logs the member ID from the route parameter

    // Validate input fields
    if (!name || !phone || !date) {
        console.warn("Missing required fields: name, phone, or date");
        return res.status(400).json({ success: false, message: 'All fields (name, phone, date) are required' });
    }

    // Log before making the database query
    console.log("Preparing SQL query to update member...");

    const sql = `UPDATE members SET name = ?, phone = ?, date = ? WHERE id = ?`;

    // Log the SQL query that will be executed (without sensitive data)
    console.log("SQL query:", sql);

    db.query(sql, [name, phone, date, memberId], (err, result) => {
        // Log any error from the query
        if (err) {
            console.error("Database error:", err); // Log database error
            return res.status(500).json({ success: false, message: err.message });
        }

        // Log the result of the query
        console.log("Database result:", result);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            console.warn(`No member found with ID: ${memberId}`);
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Log successful update
        console.log(`Member with ID ${memberId} successfully updated`);

        res.status(200).json({ success: true, message: 'Member updated successfully' });
    });
});


export default router;
