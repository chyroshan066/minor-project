// Backend/src/controllers/dashboardController.js
const pool = require("../config/db");

async function getDashboardStats(req, res) {
  const { hospital_id } = req.user;

  try {
    // 1. Today's Revenue: Sum of 'paid' from appointments scheduled today
    const revenueQuery = `
  SELECT SUM(
    CASE 
      WHEN billing_summary->>'paid' = 'true' THEN (billing_summary->>'total')::numeric
      WHEN billing_summary->>'paid' = 'false' OR billing_summary->>'paid' IS NULL THEN 0
      ELSE COALESCE((billing_summary->>'paid')::numeric, 0)
    END
  ) as total 
  FROM appointments 
  WHERE hospital_id = $1 
  AND date = CURRENT_DATE 
  AND deleted_at IS NULL`;

    // 2. Pending Appointments: Count where status is 'scheduled'
    const appointmentsQuery = `
      SELECT COUNT(*) as total 
      FROM appointments 
      WHERE hospital_id = $1 
      AND status = 'scheduled' 
      AND deleted_at IS NULL`;

    // 3. New Registrations: Patients added in the last 30 days
    const patientsQuery = `
      SELECT COUNT(*) as total 
      FROM patients 
      WHERE hospital_id = $1 
      AND created_at >= NOW() - INTERVAL '30 days' 
      AND deleted_at IS NULL`;

    // 4. Unpaid Invoices: Sum of (total - paid) from the billing_summary JSON
    const unpaidQuery = `
  SELECT SUM(
    CASE 
      WHEN billing_summary->>'paid' = 'true' THEN 0
      WHEN billing_summary->>'paid' = 'false' OR billing_summary->>'paid' IS NULL 
           THEN (billing_summary->>'total')::numeric
      ELSE (billing_summary->>'total')::numeric - COALESCE((billing_summary->>'paid')::numeric, 0)
    END
  ) as total 
  FROM appointments 
  WHERE hospital_id = $1 
  AND deleted_at IS NULL`;

    const [revenue, appointments, patients, unpaid] = await Promise.all([
      pool.query(revenueQuery, [hospital_id]),
      pool.query(appointmentsQuery, [hospital_id]),
      pool.query(patientsQuery, [hospital_id]),
      pool.query(unpaidQuery, [hospital_id]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayRevenue: parseFloat(revenue.rows[0].total || 0),
        pendingAppointments: parseInt(appointments.rows[0].total || 0),
        newRegistrations: parseInt(patients.rows[0].total || 0),
        unpaidInvoices: parseFloat(unpaid.rows[0].total || 0),
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

module.exports = { getDashboardStats };
