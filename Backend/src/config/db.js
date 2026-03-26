const { Pool } = require('pg');
const { env } = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.PGSSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : undefined
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
