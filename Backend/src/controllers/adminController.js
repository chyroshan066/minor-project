const { query } = require('../config/db');

async function systemHealth(req, res, next) {
  try {
    const start = Date.now();
    await query('SELECT 1');
    const dbMs = Date.now() - start;

    res.json({
      status: 'ok',
      db: { healthy: true, latency_ms: dbMs },
      uptime_seconds: process.uptime()
    });
  } catch (err) {
    next(err);
  }
}

async function inventoryAlerts(req, res, next) {
  try {
    // Placeholder: inventory data model not defined yet, so expose an empty list.
    res.json({
      items: [],
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { systemHealth, inventoryAlerts };

