// import mysql from 'mysql';

// // Create MySQL connection

// // const db = mysql.createPool({
// //   connectionLimit: 20,
// //   host: 'bb1h0utzxslm4l1scu03-mysql.services.clever-cloud.com',
// //   user: 'udxiddataalggym0',
// //   password: 't0d2iZavphmLmOPxv5w7',
// //   database: 'bb1h0utzxslm4l1scu03',  // Ensure the database is correctly set here
// // });

// const db = mysql.createPool({
//   connectionLimit: 10,
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'chama_db',  // Ensure the database is correctly set here
// });

// // 🔹 Create Members Table
// const membersTable = `
// CREATE TABLE IF NOT EXISTS members (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     phone VARCHAR(20) UNIQUE NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     date DATE,
//     payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//     amount DECIMAL(10, 2) DEFAULT 0.00,
//     payment_amount_status ENUM('balance', 'bonus') DEFAULT NULL,
//     total_paid DECIMAL(10, 2) DEFAULT 0.00,
//     balance DECIMAL(10, 2) DEFAULT 50000.00,
//     extra_paid DECIMAL(10, 2) DEFAULT 0.00,
//     reset_token VARCHAR(255) DEFAULT NULL,
//     reset_token_expires DATETIME DEFAULT NULL
// );
// `;
// db.query(membersTable, (err, result) => {
//   if (err) {
//     console.error('❌ Error creating members table:', err);
//     return;
//   }
//   console.log('✅ Members table ready');
// });

// // 🔹 Create Contributions Table
// const contributionsTable = `
// CREATE TABLE IF NOT EXISTS contributions (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     member_id INT NOT NULL,
//     amount DECIMAL(10,2) NOT NULL,
//     payment_method VARCHAR(50) NOT NULL,
//     transaction_id VARCHAR(100) NOT NULL UNIQUE,
//     payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
// );
// `;
// db.query(contributionsTable, (err, result) => {
//   if (err) {
//     console.error('❌ Error creating contributions table:', err);
//     return;
//   }
//   console.log('✅ Contributions table ready');
// });

// // 🔹 Create Withdrawals Table
// const withdrawalsTable = `
// CREATE TABLE IF NOT EXISTS withdrawals (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     member_id INT NOT NULL,
//     amount DECIMAL(10,2) NOT NULL,
//     withdrawal_method VARCHAR(50) NOT NULL,
//     transaction VARCHAR(100) UNIQUE NOT NULL,
//     withdrawal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
// );
// `;
// db.query(withdrawalsTable, (err, result) => {
//   if (err) {
//     console.error('❌ Error creating withdrawals table:', err);
//     return;
//   }
//   console.log('✅ Withdrawals table ready');
// });

// // 🔹 Create Payments Table
// const paymentsTable = `
// CREATE TABLE IF NOT EXISTS payments (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     member_id INT NOT NULL,
//     amount DECIMAL(10,2) NOT NULL,
//     phone VARCHAR(20) NOT NULL,
//     status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
//     date_paid TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
//     transaction VARCHAR(64) UNIQUE NOT NULL,
//     FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
//     INDEX idx_member_id (member_id),
//     INDEX idx_status (status)
// );
// `;

// db.query(paymentsTable, (err, result) => {
//   if (err) {
//     console.error('❌ Error creating payments table:', err);
//     return;
//   }
//   console.log('✅ Payments table ready');
// });

// export default db;


import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// 🔹 Use a global pool for serverless environments (Vercel/Neon)
let pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Neon/Postgres connection string
    ssl: { rejectUnauthorized: false }, // required for Neon SSL
  });
}

pool = global.pool;

// 🔹 Table definitions
const membersTable = `
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'success')) DEFAULT 'pending',
    amount NUMERIC(10, 2) DEFAULT 0.00,
    payment_amount_status VARCHAR(20) CHECK (payment_amount_status IN ('balance', 'bonus')),
    total_paid NUMERIC(10, 2) DEFAULT 0.00,
    expected_contribution NUMERIC(10, 2) DEFAULT 200000.00,
    balance NUMERIC(10, 2) DEFAULT 200000.00,
    extra_paid NUMERIC(10, 2) DEFAULT 0.00,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP
);
`;

const contributionsTable = `
CREATE TABLE IF NOT EXISTS contributions (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const withdrawalsTable = `
CREATE TABLE IF NOT EXISTS withdrawals (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    withdrawal_method VARCHAR(50) NOT NULL,
    transaction VARCHAR(100) UNIQUE NOT NULL,
    withdrawal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const paymentsTable = `
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'success')) DEFAULT 'pending',
    date_paid TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    transaction VARCHAR(64) UNIQUE NOT NULL
);
`;

// 🔹 Initialize DB safely
async function initDB() {
  try {
    console.log("✅ Connecting to Neon PostgreSQL...");

    // Just run queries directly; pool manages connections automatically
    await pool.query(membersTable);
    console.log("✅ Members table ready");

    await pool.query(contributionsTable);
    console.log("✅ Contributions table ready");

    await pool.query(withdrawalsTable);
    console.log("✅ Withdrawals table ready");

    await pool.query(paymentsTable);
    console.log("✅ Payments table ready");
  } catch (err) {
    console.error("❌ DB Initialization Error:", err);
  }
}

// 🔹 Immediately initialize tables
initDB();

export default pool;
