const { query } = require('../config/db');

async function createMedicalRecord({ hospitalId, patientId, dentistId, diagnosisEnc, treatmentEnc, notesEnc, prescriptionEnc }) {
  const { rows } = await query(
    `INSERT INTO medical_records (hospital_id, patient_id, created_by, diagnosis_enc, treatment_enc, notes_enc, prescription_enc)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, patient_id, diagnosis_enc, treatment_enc, notes_enc, prescription_enc, created_at`,
    [hospitalId, patientId, dentistId, diagnosisEnc, treatmentEnc, notesEnc || null, prescriptionEnc || null]
  );
  return rows[0];
}

async function getMedicalRecord(id, hospitalId) {
  const { rows } = await query(
    `SELECT mr.id, mr.patient_id, p.email AS patient_email, mr.diagnosis_enc, mr.treatment_enc, mr.notes_enc, mr.prescription_enc, mr.created_at
     FROM medical_records mr
     LEFT JOIN patients p ON mr.patient_id = p.id
     WHERE mr.id = $1 AND mr.hospital_id = $2 AND mr.deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rows[0] || null;
}

async function updateMedicalRecord(id, hospitalId, { diagnosisEnc, treatmentEnc, notesEnc, prescriptionEnc }) {
  const { rows } = await query(
    `UPDATE medical_records
     SET diagnosis_enc = COALESCE($2, diagnosis_enc),
         treatment_enc = COALESCE($3, treatment_enc),
         notes_enc = COALESCE($4, notes_enc),
         prescription_enc = COALESCE($5, prescription_enc)
     WHERE id = $1 AND hospital_id = $6 AND deleted_at IS NULL
     RETURNING id, patient_id, diagnosis_enc, treatment_enc, notes_enc, prescription_enc, created_at`,
    [id, diagnosisEnc ?? null, treatmentEnc ?? null, notesEnc ?? null, prescriptionEnc ?? null, hospitalId]
  );
  return rows[0] || null;
}

async function softDeleteMedicalRecord(id, hospitalId) {
  const { rowCount } = await query(
    `UPDATE medical_records SET deleted_at = NOW() WHERE id = $1 AND hospital_id = $2 AND deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rowCount > 0;
}

async function listMedicalRecordsByPatient({ hospitalId, patientId, limit, offset }) {
  const { rows } = await query(
    `SELECT mr.id, mr.patient_id, p.email AS patient_email, mr.diagnosis_enc, mr.treatment_enc, mr.notes_enc, mr.prescription_enc, mr.created_at
     FROM medical_records mr
     LEFT JOIN patients p ON mr.patient_id = p.id
     WHERE mr.patient_id = $1 AND mr.hospital_id = $2 AND mr.deleted_at IS NULL
     ORDER BY mr.created_at DESC
     LIMIT $3 OFFSET $4`,
    [patientId, hospitalId, limit, offset]
  );
  return rows;
}

async function listMedicalRecordsByDentist({ hospitalId, dentistId, limit, offset }) {
  const { rows } = await query(
    `SELECT mr.id, mr.patient_id, p.email AS patient_email, mr.diagnosis_enc, mr.treatment_enc, mr.notes_enc, mr.prescription_enc, mr.created_at
     FROM medical_records mr
     LEFT JOIN patients p ON mr.patient_id = p.id
     WHERE mr.created_by = $1 AND mr.hospital_id = $2 AND mr.deleted_at IS NULL
     ORDER BY mr.created_at DESC
     LIMIT $3 OFFSET $4`,
    [dentistId, hospitalId, limit, offset]
  );
  return rows;
}

module.exports = {
  createMedicalRecord,
  getMedicalRecord,
  updateMedicalRecord,
  softDeleteMedicalRecord,
  listMedicalRecordsByPatient,
  listMedicalRecordsByDentist
};