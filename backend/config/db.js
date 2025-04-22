import mysql from 'mysql';

// Create MySQL connection

const db = mysql.createPool({
  connectionLimit: 10,
  host: 'bb1h0utzxslm4l1scu03-mysql.services.clever-cloud.com',
  user: 'udxiddataalggym0',
  password: 't0d2iZavphmLmOPxv5w7',
  database: 'bb1h0utzxslm4l1scu03',  // Ensure the database is correctly set here
});

// const db = mysql.createPool({
//   connectionLimit: 10,
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'chama_db',  // Ensure the database is correctly set here
// });

// 🔹 Create Members Table
const membersTable = `
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_amount_status ENUM('balance', 'bonus') DEFAULT NULL,
    total_paid DECIMAL(10, 2) DEFAULT 0.00,
    balance DECIMAL(10, 2) DEFAULT 50000.00,
    extra_paid DECIMAL(10, 2) DEFAULT 0.00,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL
);
`;
db.query(membersTable, (err, result) => {
  if (err) {
    console.error('❌ Error creating members table:', err);
    return;
  }
  console.log('✅ Members table ready');
});

// 🔹 Create Contributions Table
const contributionsTable = `
CREATE TABLE IF NOT EXISTS contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
`;
db.query(contributionsTable, (err, result) => {
  if (err) {
    console.error('❌ Error creating contributions table:', err);
    return;
  }
  console.log('✅ Contributions table ready');
});

// 🔹 Create Withdrawals Table
const withdrawalsTable = `
CREATE TABLE IF NOT EXISTS withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    withdrawal_method VARCHAR(50) NOT NULL,
    transaction VARCHAR(100) UNIQUE NOT NULL,
    withdrawal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
`;
db.query(withdrawalsTable, (err, result) => {
  if (err) {
    console.error('❌ Error creating withdrawals table:', err);
    return;
  }
  console.log('✅ Withdrawals table ready');
});

// 🔹 Create Payments Table
const paymentsTable = `
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    date_paid TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    transaction VARCHAR(64) UNIQUE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_member_id (member_id),
    INDEX idx_status (status)
);
`;

db.query(paymentsTable, (err, result) => {
  if (err) {
    console.error('❌ Error creating payments table:', err);
    return;
  }
  console.log('✅ Payments table ready');
});

export default db;
