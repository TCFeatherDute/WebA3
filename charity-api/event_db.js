/**
 * @module Database
 * @description MySQL database connection pool configuration.
 * Exposes a shared promise-based connection pool used by every
 * Express route so that individual connections do not need to be
 * opened and closed for each API request.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Shared MySQL connection pool instance.
 *
 * `dateStrings: true` forces DATE / DATETIME columns to be returned as formatted strings ('YYYY-MM-DD' / 'YYYY-MM-DD HH:mm:ss') instead of JavaScript Date objects, which avoids timezone-related date shifts when the values are serialised to JSON and rendered by the Angular front-ends.
 * `decimalNumbers: true` returns DECIMAL columns (prices and amounts) as JavaScript numbers instead of strings; 
 *
 * @type {import('mysql2/promise').Pool}
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true
});

module.exports = pool;
