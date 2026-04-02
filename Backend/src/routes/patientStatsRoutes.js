// ADDED: GET /api/patients/stats/daily
// Returns daily new patient registration counts for the past N days.
// Scoped to the authenticated user's hospital_id (from JWT via authRequired).
// Add this route BEFORE the /:id route in your patientRoutes.js to avoid
// Express matching "stats" as a patient ID.

const express = require("express");
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// ── GET /api/patients/stats/daily ─────────────────────────────────────────────
// Query params:
//   days (number, default 30) — how many past days to include
// Response:
//   { items: [{ date: "YYYY-MM-DD", count: number }], total, period_days }
router.get("/stats/daily", authRequired, async (req, res) => {
  try {
    const hospital_id = req.user.hospital_id;

    // ADDED: Clamp days to 1–90 to prevent expensive queries
    const days = Math.min(Math.max(parseInt(req.query.days ?? "30", 10), 1), 90);

    // ADDED: Generate a complete date series so days with 0 registrations
    // still appear in the chart (no gaps). Uses generate_series in PostgreSQL.
    const result = await pool.query(
      `
      SELECT
        series.day::date           AS date,
        COALESCE(counts.count, 0)  AS count
      FROM
        -- ADDED: generate every day in the range so zeros show up in chart
        generate_series(
          CURRENT_DATE - ($2 - 1) * INTERVAL '1 day',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS series(day)
      LEFT JOIN (
        SELECT
          DATE(created_at) AS reg_date,
          COUNT(*)::int    AS count
        FROM   patients
        WHERE  hospital_id = $1
          AND  deleted_at  IS NULL
          AND  created_at >= CURRENT_DATE - ($2 - 1) * INTERVAL '1 day'
        GROUP  BY DATE(created_at)
      ) AS counts ON counts.reg_date = series.day::date
      ORDER BY series.day ASC
      `,
      [hospital_id, days]
    );

    const items = result.rows.map((row) => ({
      date: row.date.toISOString().split("T")[0], // "YYYY-MM-DD"
      count: row.count,
    }));

    return res.json({
      items,
      total: items.reduce((sum, r) => sum + r.count, 0),
      period_days: days,
    });
  } catch (err) {
    console.error("[patients/stats/daily] Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch patient stats" });
  }
});

module.exports = { patientStatsRoute: router };