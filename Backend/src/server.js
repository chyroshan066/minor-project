const app = require("./app");
const { env } = require("./config/env");
const { pool } = require("./config/db");

async function start() {
  // Verify DB connectivity before accepting traffic
  try {
    await pool.query("SELECT 1");
    console.log("[server] Database connection verified ✓");
  } catch (err) {
    console.error("[server] Could not connect to database:", err.message);
    process.exit(1);
  }
 
  app.listen(env.PORT, () => {
    console.log(`[server] API listening on http://localhost:${env.PORT}`);
  });
}
 
start();