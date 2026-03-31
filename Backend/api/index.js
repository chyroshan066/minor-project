// const app = require("../src/app");

// module.exports = app;






const app = require("../src/app");
const { pool } = require("../src/config/db");
 
// Track whether we've already verified the DB is reachable.
// In a warm Lambda/serverless invocation this will already be true.
let dbReady = false;
 
module.exports = async (req, res) => {
  // ── 1. One-time DB warm-up check ──────────────────────────────────────────
  if (!dbReady) {
    try {
      await pool.query("SELECT 1");
      dbReady = true;
    } catch (err) {
      console.error("[api/index] DB connection failed:", err.message);
      // Return 503 immediately — no point running app logic without a DB
      return res.status(503).json({ error: "Database unavailable" });
    }
  }
 
  // ── 2. Delegate to Express ─────────────────────────────────────────────────
  // Express apps ARE valid Node.js http.RequestListener functions,
  // so Vercel can call them directly — no serverless-http needed.
  return app(req, res);
};
 