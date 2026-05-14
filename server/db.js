const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'itam_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  // Use for quick, single-query executions
  query: (text, params) => pool.query(text, params),
  // Use when we need a dedicated client for multi-query Transactions (BEGIN/COMMIT)
  getClient: () => pool.connect(), 
};
