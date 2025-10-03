import express from 'express';
import mysql from 'mysql';
import pool from '../config/db.js';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import multer from 'multer'
import {authorize} from '../middleware/authorize.js'
import {verifyAdmin} from '../middleware/verifyAdmin.js'
import transporter from "../config/nodemailer.js";



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



dotenv.config();

// REGISTER MEMBER
router.post("/register", async (req, res) => {
  console.log("✅ Incoming request body:", req.body);

  const { name, email, phone, password, role = "member" } = req.body;

  // ===== Validate input =====
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, msg: "All fields are required" });
  }

  const phoneRegex = /^(254\d{9}|07\d{8})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      msg: "Phone number must start with 254 or 07 and be valid",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      msg: "Password should be at least 6 characters long",
    });
  }

  try {
    // ===== Check if email or phone already exists =====
    const checkQuery = `SELECT id FROM members WHERE email = $1 OR phone = $2`;
    const { rows: existing } = await db.query(checkQuery, [email, phone]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, msg: "Email or phone already in use" });
    }
    console.log("✅ Email and phone are available");

    // ===== Hash password =====
    const hashedPassword = await bcryptjs.hash(password, 10);

    // ===== Insert member into DB =====
    const insertQuery = `
      INSERT INTO members (name, email, phone, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const insertRes = await db.query(insertQuery, [name, email, phone, hashedPassword, role]);
    const newMemberId = insertRes.rows[0].id;
    console.log("✅ Member inserted with ID:", newMemberId);

    // ===== Generate JWT token =====
    const token = jwt.sign({ id: newMemberId, email, role }, process.env.SECRET_KEY, { expiresIn: "7d" });

    // ===== Send welcome email =====
    if (!process.env.SENDER_EMAIL) {
      console.warn("⚠️ SENDER_EMAIL not defined in .env");
    }
    if (!email) {
      console.warn("⚠️ Recipient email is empty");
    }

    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "🎉 Welcome to Our Group Savings Platform!",
        text: `Hello ${name},\n\nThank you for joining our group savings community! Start contributing and track your savings.\n\nHappy saving!\n\n- Your Savings Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin:auto; padding:20px; background-color:#f8f8f8; color:#333;">
            <h2 style="color:#2c3e50; text-align:center;">💰 Welcome to Group Savings!</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Congratulations on joining our <strong>group savings community</strong>! Your account has been created successfully with email: <strong>${email}</strong>.</p>
            <p>💡 Get started by making your first contribution and track your progress in real-time.</p>

            <h3 style="margin-top: 30px; color:#4CAF50;">📈 Benefits of Group Savings</h3>
            <ul>
              <li>Easy and transparent tracking of contributions</li>
              <li>Collaborate with your group members</li>
              <li>Receive timely updates and notifications</li>
              <li>Celebrate milestones and completed savings!</li>
            </ul>

            <p style="margin-top: 20px;">✨ Start contributing today and grow your savings with the group!</p>

            <hr style="margin:30px 0;">
            <p style="font-size:0.85em; color:#888; text-align:center;">
              You're receiving this email because you joined our group savings platform.<br>
              <strong>The Group Savings Team</strong>
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Welcome email sent successfully:", info.messageId);
    } catch (emailErr) {
      console.error("❌ Welcome email failed:", emailErr.message);
    }

    // ===== Set cookie and header =====
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(201).json({
      success: true,
      message: "✅ Member registered successfully",
      token,
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});




// LOGIN MEMBER
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("📥 Incoming login request:", req.body);

  if (!email || !password) {
    return res.status(400).json({ success: false, msg: "Email and password are required" });
  }

  try {
    // ✅ Postgres uses $1 instead of ?
    const sql = `SELECT id, name, email, phone, password, role FROM members WHERE email = $1`;
    const { rows } = await db.query(sql, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, msg: "Invalid email or password" });
    }

    const member = rows[0];

    // ✅ Compare password
    const isMatch = await bcryptjs.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Invalid email or password" });
    }

    // ✅ Prepare JWT payload
    const payload = {
      id: member.id,
      email: member.email,
      role: member.role,
    };

    // ✅ Create token
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "7d" });

    // ✅ Set token in cookie
    res.cookie("authToken", token, {
      httpOnly: true,   // prevent JS access
      secure: true,     // only HTTPS (set false in localhost dev if needed)
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    // ✅ Also set token in header
    res.setHeader("Authorization", `Bearer ${token}`);

    console.log("✅ Login successful. Token set in cookie and header.");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
      },
      token,
    });
  } catch (error) {
    console.error("🚨 Login error:", error);
    return res.status(500).json({ success: false, msg: "Login failed. Please try again." });
  }
});

// RESET PASSWORD
router.post("/forgot/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    // ✅ Postgres query with $1 placeholder
    const { rows } = await db.query("SELECT * FROM members WHERE email = $1", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const user = rows[0];

    // ✅ Create reset token
    const resetToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    // ✅ Build reset link
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `Reset your password using this link: ${resetUrl}`;

    try {
      await sendEmail(email, "Reset Your Password", message);
      res.status(200).json({ message: "Reset link sent to email" });
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      res.status(500).json({ msg: "Failed to send email", error: emailErr.message });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});


//single member
router.get('/saved/save/saving', authorize(['member', 'admin']), async (req, res) => {
  const memberId = req.member?.id;
  console.log("🔹 Incoming request for memberId:", memberId);

  if (!memberId) {
    return res.status(401).json({ message: "Unauthorized. No member ID found." });
  }

  const sql = `
    SELECT 
      m.id AS member_id,
      m.name,
      m.email,
      m.phone,
      COALESCE(m.date, m.created_at) AS member_since,
      m.expected_contribution,
      p.id AS payment_id,
      p.amount,
      p.status,
      p.transaction,
      p.date_paid
    FROM members m
    LEFT JOIN payments p ON m.id = p.member_id
    WHERE m.id = $1
    ORDER BY p.date_paid ASC;
  `;

  try {
    console.log("🔹 Executing SQL with memberId:", memberId);
    const { rows } = await db.query(sql, [memberId]);
    console.log("🔹 Rows returned:", rows.length);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Member not found." });
    }

    // Member info from first row
    const first = rows[0];
    const member = {
      id: first.member_id,
      name: first.name || "N/A",
      email: first.email || "N/A",
      phone: first.phone || "N/A",
      member_since: first.member_since
        ? new Date(first.member_since).toISOString()
        : "N/A",
      expected_contribution: Number(first.expected_contribution) || 0,
    };

    // Map all payments
    const payments = rows
      .filter(r => r.amount !== null)
      .map(r => ({
        id: r.payment_id,
        amount: Number(r.amount),
        status: r.status || "pending",
        transaction_id: r.transaction || "N/A",
        date_paid: r.date_paid ? new Date(r.date_paid).toISOString() : null,
      }));

    // Only completed payments count for totals
    const completedPayments = payments.filter(
      p => p.status.toLowerCase() === "completed"
    );

    const totalPaid = completedPayments.reduce((acc, p) => acc + p.amount, 0);
    const balance = Math.max(member.expected_contribution - totalPaid, 0);
    const extraPaid = Math.max(totalPaid - member.expected_contribution, 0);

    res.json({
      ...member,
      total_paid: totalPaid, // only completed transactions
      balance,
      extra_paid: extraPaid,
      payments, // still send all payments to show in table if needed
      message:
        totalPaid === 0
          ? "You have not contributed yet."
          : "Thank you for your contribution.",
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});





router.get("/transact/transactions/track", authorize(['member','admin']), async (req, res) => {
    const memberId = req.member?.id; // Using req.member.id
    console.log("🚀 Member ID:", memberId);

    if (!memberId) {
        return res.status(400).json({ message: "Member ID not found in request." });
    }

    // Use quotes for "transaction" since it's a reserved word in Postgres
    const sql = `
        SELECT date_paid, amount, status, "transaction"
        FROM payments
        WHERE member_id = $1
        ORDER BY date_paid DESC
    `;

    try {
        const { rows } = await pool.query(sql, [memberId]);
        console.log("📄 Query Result:", rows);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No transactions found for this member." });
        }

        res.status(200).json({ success: true, transactions: rows });
    } catch (err) {
        console.error('❌ Database query error:', err);
        res.status(500).json({ 
            message: "❌ Database query error", 
            error: err.message 
        });
    }
});

//delete member

router.delete('/:id/delete', verifyAdmin, async (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM members WHERE id = $1`;

    try {
        const result = await pool.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, message: 'Member deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//update member

router.put('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const sql = `UPDATE members SET name = $1, email = $2, phone = $3 WHERE id = $4`;

    try {
        const result = await pool.query(sql, [name, email, phone, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, message: 'Member updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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


router.get('/all/all_members', async (req, res) => {
    const sql = `SELECT * FROM members`;

    try {
        const result = await pool.query(sql);

        // PostgreSQL returns rows in result.rows
        const updatedMembers = result.rows.map(member => {
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
                payment_status,
                created_at: member.created_at,
                date: member.date
            };
        });

        res.status(200).json({
            success: true,
            members: updatedMembers
        });

    } catch (err) {
        console.error("❌ Database error:", err);
        res.status(500).json({ error: err.message });
    }
});



router.get("/count", async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) AS total_members FROM members");

        // In PostgreSQL, COUNT(*) returns a string, so we parse it
        const count = parseInt(result.rows[0].total_members, 10);

        res.json({ total_members: count });
    } catch (err) {
        console.error("❌ Database error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


//profile image
const upload = multer({ storage: multer.memoryStorage() });


// Upload profile picture to Cloudinary


router.put('/:id/profile', upload.single('profile_picture'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const uploadStream = cloudinary.v2.uploader.upload_stream({ folder: 'profiles' }, async (error, uploadedImage) => {
            if (error) return res.status(500).json({ error: 'Upload failed' });

            try {
                const sql = `UPDATE members SET profile_picture = $1 WHERE id = $2 RETURNING *`;
                const values = [uploadedImage.secure_url, req.params.id];

                const result = await pool.query(sql, values);
                res.json({ message: 'Profile updated', profile_picture: uploadedImage.secure_url, updatedMember: result.rows[0] });
            } catch (dbErr) {
                res.status(500).json({ error: dbErr.message });
            }
        });

        // Send buffer to Cloudinary
        uploadStream.end(req.file.buffer);

    } catch (err) {
        res.status(500).json({ error: 'Upload error' });
    }
});


//

router.put('/updating/:id/updated', async (req, res) => {
    const { name, phone, date } = req.body;
    const memberId = req.params.id;

    // Log the incoming request data
    console.log("Request body:", req.body);
    console.log("Member ID:", memberId);

    // Validate input fields
    if (!name || !phone || !date) {
        console.warn("Missing required fields: name, phone, or date");
        return res.status(400).json({ success: false, message: 'All fields (name, phone, date) are required' });
    }

    try {
        console.log("Preparing SQL query to update member...");

        const sql = `UPDATE members SET name = $1, phone = $2, date = $3 WHERE id = $4 RETURNING *`;
        const values = [name, phone, date, memberId];

        console.log("SQL query:", sql);

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            console.warn(`No member found with ID: ${memberId}`);
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        console.log(`Member with ID ${memberId} successfully updated`);
        console.log("Updated member data:", result.rows[0]);

        res.status(200).json({ success: true, message: 'Member updated successfully', updatedMember: result.rows[0] });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});



export default router;