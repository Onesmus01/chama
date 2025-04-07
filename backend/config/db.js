import mysql from 'mysql';

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',   // Change if using remote database
    user: 'root',        // Your MySQL username
    password: '',        // Your MySQL password
    database: 'chama_db' // Database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL');

    // Create database if it does not exist
    db.query(`CREATE DATABASE IF NOT EXISTS chama_db`, (err, result) => {
        if (err) throw err;
        console.log('✅ Database chama_db ready');
    });

    // Use the database
    db.query(`USE chama_db`, (err, result) => {
        if (err) throw err;
    });

    // 🔹 Create Members Table (Includes Role and Password for Authentication)
    const membersTable = `
        CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique member ID
            name VARCHAR(255) NOT NULL,             -- Member's full name
            email VARCHAR(255) UNIQUE NOT NULL,     -- Member's email (should be unique)
            phone VARCHAR(20) UNIQUE NOT NULL,      -- Member's phone (unique)
            password VARCHAR(255) NOT NULL,         -- Hashed password
            role ENUM('admin', 'member') NOT NULL DEFAULT 'member', -- Role (admin or member)
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date the member was created
        )
    `;
    db.query(membersTable, (err, result) => {
        if (err) throw err;
        console.log('✅ Members table ready');
    });

    // 🔹 Create Contributions Table (Tracks Payments)
    const contributionsTable = `
        CREATE TABLE IF NOT EXISTS contributions (
            id INT AUTO_INCREMENT PRIMARY KEY,       -- Contribution ID
            member_id INT NOT NULL,                  -- Foreign key linking to members table
            amount DECIMAL(10,2) NOT NULL,           -- Amount of contribution
            payment_method VARCHAR(50) NOT NULL,     -- Payment method (e.g., M-Pesa, Bank)
            transaction_id VARCHAR(100) NOT NULL UNIQUE, -- Unique transaction ID
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date of payment
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE -- Foreign key to members table
        )
    `;
    db.query(contributionsTable, (err, result) => {
        if (err) throw err;
        console.log('✅ Contributions table ready');
    });

    // 🔹 Create Withdrawals Table (If members can withdraw money)
    const withdrawalsTable = `
        CREATE TABLE IF NOT EXISTS withdrawals (
            id INT AUTO_INCREMENT PRIMARY KEY,         -- Withdrawal ID
            member_id INT NOT NULL,                    -- Foreign key linking to members table
            amount DECIMAL(10,2) NOT NULL,             -- Amount withdrawn
            withdrawal_method VARCHAR(50) NOT NULL,    -- Withdrawal method (e.g., M-Pesa, Bank)
            transaction_id VARCHAR(100) UNIQUE NOT NULL, -- Unique transaction ID
            withdrawal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date of withdrawal
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE -- Foreign key to members table
        )
    `;
    db.query(withdrawalsTable, (err, result) => {
        if (err) throw err;
        console.log('✅ Withdrawals table ready');
    });

    // 🔹 Create Payments Table (For payment tracking)
    const paymentsTable = `
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,          -- Payment ID
            member_id INT NOT NULL,                     -- Foreign key linking to members table
            name VARCHAR(255) NOT NULL,                 -- Payer's name
            amount DECIMAL(10,2) NOT NULL,              -- Amount paid
            phone VARCHAR(20) NOT NULL,                 -- Payer's phone number
            status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending', -- Payment status
            date_paid TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date of payment
            transaction_id VARCHAR(255) UNIQUE NOT NULL,   -- Unique transaction ID
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE -- Foreign key to members table
            
        )
    `;
    db.query(paymentsTable, (err, result) => {
        if (err) {
            console.error("Error creating payments table:", err);
            return; // Exits early on error
        }
        console.log('✅ Payments table ready');
    });
});

export default db;
