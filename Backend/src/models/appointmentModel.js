const { query } = require('../config/db');

// Helper to handle JSON stringification consistently
const stringifyBilling = (val) => (val ? JSON.stringify(val) : null);

async function createAppointment({ hospitalId, patientId, dentistId, date, time, status, appointmentStatus, billingSummary }) {
  const { rows } = await query(
    `INSERT INTO appointments (hospital_id, patient_id, dentist_id, date, time, status, appointment_status, billing_summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, patient_id, dentist_id, date, time, status, appointment_status, billing_summary, created_at`,
    [
      hospitalId,
      patientId,
      dentistId,
      date,
      time,
      status || 'scheduled',
      appointmentStatus || 'Scheduled',
      stringifyBilling(billingSummary)
    ]
  );
  return rows[0];
}

async function getAppointment(id, hospitalId) {
  const { rows } = await query(
    `SELECT a.*, 
            p.email as patient_email,
            u.name as dentist_name
     FROM appointments a
     LEFT JOIN patients p ON a.patient_id = p.id
     LEFT JOIN users u ON a.dentist_id = u.id
     WHERE a.id = $1 AND a.hospital_id = $2 AND a.deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rows[0] || null;
}

async function updateAppointment(id, hospitalId, { patientId, dentistId, date, time, status, appointmentStatus, billingSummary }) {
  // Use COALESCE carefully to allow partial updates
  const { rows } = await query(
    `UPDATE appointments
     SET patient_id = COALESCE($2, patient_id),
         dentist_id = COALESCE($3, dentist_id),
         date = COALESCE($4, date),
         time = COALESCE($5, time),
         status = COALESCE($6, status),
         appointment_status = COALESCE($7, appointment_status),
         billing_summary = COALESCE($8, billing_summary)
     WHERE id = $1 AND hospital_id = $9 AND deleted_at IS NULL
     RETURNING *`,
    [
      id,
      patientId || null,
      dentistId || null,
      date || null,
      time || null,
      status || null,
      appointmentStatus || null,
      billingSummary !== undefined ? stringifyBilling(billingSummary) : null,
      hospitalId
    ]
  );
  return rows[0] || null;
}

async function softDeleteAppointment(id, hospitalId) {
  const { rowCount } = await query(
    `UPDATE appointments SET deleted_at = NOW() WHERE id = $1 AND hospital_id = $2 AND deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rowCount > 0;
}

async function listAppointments({ hospitalId, limit, offset, patientId, dentistId, status, dateFrom, dateTo }) {
  // 1. Base SQL with Joins
  // Note: Using p.email because p.name_enc is encrypted in your schema
  let sql = `
    SELECT a.*, 
           p.email as patient_email,
           u.name as dentist_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.dentist_id = u.id
    WHERE a.deleted_at IS NULL AND a.hospital_id = $1
  `;
  
  const params = [hospitalId];
  let i = 2; 

  // 2. Dynamic Filtering
  if (patientId) {
    sql += ` AND a.patient_id = $${i++}`;
    params.push(patientId);
  }
  if (dentistId) {
    sql += ` AND a.dentist_id = $${i++}`;
    params.push(dentistId);
  }
  if (status) {
    sql += ` AND a.status = $${i++}`;
    params.push(status);
  }
  if (dateFrom) {
    sql += ` AND a.date >= $${i++}`;
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += ` AND a.date <= $${i++}`;
    params.push(dateTo);
  }

  // 3. Sorting & Pagination
  sql += ` ORDER BY a.date ASC, a.time ASC LIMIT $${i++} OFFSET $${i++}`;
  params.push(limit, offset);

  const { rows } = await query(sql, params);
  return rows;
}

module.exports = {
  createAppointment,
  getAppointment,
  updateAppointment,
  softDeleteAppointment,
  listAppointments
};