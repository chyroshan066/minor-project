const {
  createMedicalRecord,
  getMedicalRecord,
  updateMedicalRecord,
  softDeleteMedicalRecord,
  listMedicalRecordsByPatient,
  listMedicalRecordsByDentist
} = require('../models/medicalRecordModel');
const { getPatient, getPatientByEmail } = require('../models/patientModel');
const { writeAuditLog } = require('../models/auditLogModel');
const { notFound, badRequest } = require('../utils/errors');
const { encryptField, decryptField } = require('../utils/crypto');
const { getPagination } = require('../utils/pagination');

function toDecrypted(record) {
  return {
    id: record.id,
    patient_id: record.patient_id,
    patient_email: record.patient_email || null,
    diagnosis: decryptField(record.diagnosis_enc),
    treatment: decryptField(record.treatment_enc),
    notes: record.notes_enc ? decryptField(record.notes_enc) : null,
    prescription: record.prescription_enc ? decryptField(record.prescription_enc) : null,
    created_at: record.created_at
  };
}

async function create(req, res, next) {
  try {
    const { patient_email, diagnosis, treatment, notes, prescription } = req.body;
    const hospitalId = req.user.hospital_id;
    const dentistId = req.user.id;

    if (!patient_email) return next(badRequest('Patient email is required'));

    const patient = await getPatientByEmail(patient_email, hospitalId);
    if (!patient) return next(notFound('No patient found with this email in your hospital'));

    const created = await createMedicalRecord({
      hospitalId,
      dentistId,
      patientId: patient.id,
      diagnosisEnc: encryptField(diagnosis),
      treatmentEnc: encryptField(treatment),
      notesEnc: notes === undefined || notes === null ? null : encryptField(notes),
      prescriptionEnc: prescription === undefined || prescription === null ? null : encryptField(prescription)
    });

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: 'MEDICAL_RECORD_CREATE',
      resource: 'medical_records',
      resourceId: created.id,
      metadata: { patient_id: patient.id, patient_email }
    });

    res.status(201).json({ medicalRecord: toDecrypted({ ...created, patient_email }) });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const record = await getMedicalRecord(req.params.id, hospitalId);
    if (!record) return next(notFound('Medical record not found'));

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: 'MEDICAL_RECORD_READ',
      resource: 'medical_records',
      resourceId: record.id,
      metadata: { patient_id: record.patient_id }
    });

    res.json({ medicalRecord: toDecrypted(record) });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const { diagnosis, treatment, notes, prescription } = req.body;
    
    const updated = await updateMedicalRecord(req.params.id, hospitalId, {
      diagnosisEnc: diagnosis !== undefined ? encryptField(diagnosis) : null,
      treatmentEnc: treatment !== undefined ? encryptField(treatment) : null,
      notesEnc: notes === undefined ? null : notes === null ? null : encryptField(notes),
      prescriptionEnc: prescription === undefined ? null : prescription === null ? null : encryptField(prescription)
    });
    
    if (!updated) return next(notFound('Medical record not found'));

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: 'MEDICAL_RECORD_UPDATE',
      resource: 'medical_records',
      resourceId: updated.id,
      metadata: { patient_id: updated.patient_id }
    });

    res.json({ medicalRecord: toDecrypted(updated) });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const ok = await softDeleteMedicalRecord(req.params.id, hospitalId);
    if (!ok) return next(notFound('Medical record not found'));

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: 'MEDICAL_RECORD_DELETE',
      resource: 'medical_records',
      resourceId: req.params.id
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listByPatient(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const { limit, offset, page } = getPagination(req.query);

    const patient = await getPatient(req.params.patientId, hospitalId);
    if (!patient) return next(notFound('Patient not found'));

    const itemsEnc = await listMedicalRecordsByPatient({
      hospitalId,
      patientId: req.params.patientId,
      limit,
      offset
    });

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: 'MEDICAL_RECORD_LIST',
      resource: 'medical_records',
      metadata: { patient_id: req.params.patientId, page, limit }
    });

    res.json({ page, limit, items: itemsEnc.map(toDecrypted) });
  } catch (err) {
    next(err);
  }
}

async function listByDentist(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const dentistId = req.user.id;
    const { limit, offset, page } = getPagination(req.query);

    const itemsEnc = await listMedicalRecordsByDentist({
      hospitalId,
      dentistId,
      limit,
      offset
    });

    await writeAuditLog({
      userId: dentistId,
      hospitalId,
      action: 'MEDICAL_RECORD_LIST_BY_DENTIST',
      resource: 'medical_records',
      metadata: { page, limit }
    });

    res.json({ 
      page, 
      limit, 
      items: itemsEnc.map(toDecrypted) 
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, get, update, remove, listByPatient, listByDentist };