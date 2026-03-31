const serverless = require('serverless-http');

// ADDED: Import the Express app from app2.js (pure config, no listen())
const app = require('./app');

// ADDED: Import DB pool — update this path to match your project structure
const { pool } = require('./config/db');

// ADDED: Connection cache flag
// Serverless containers are reused on warm invocations — this prevents
// a fresh DB connection attempt on every single request
let isConnected = false;

// ADDED: Lazy DB connection — pings the pool once per container lifetime
async function connectToDatabase() {
  if (isConnected) return;

  try {
    await pool.query('SELECT 1');
    isConnected = true;
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

// ADDED: Pre-wrap the Express app with serverless-http ONCE at module level
// This is the key fix — serverless() must wrap the Express app directly,
// NOT an async function. Calling serverless(asyncFn) was causing the crash.
const handler = serverless(app);

// ADDED: Vercel calls this exported async function per incoming request
module.exports = async (req, res) => {
  // ADDED: Handle CORS preflight before anything else
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  // ADDED: Ensure DB is ready — returns 503 if pool is unreachable
  try {
    await connectToDatabase();
  } catch (err) {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  // ADDED: Delegate to the pre-wrapped serverless handler
  return handler(req, res);
};