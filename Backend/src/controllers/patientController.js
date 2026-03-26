const {
  createPatient,
  getPatient,
  updatePatient,
  softDeletePatient,
  listPatients
} = require('../models/patientModel');
const { writeAuditLog } = require('../models/auditLogModel');
const { notFound } = require('../utils/errors');
const { getPagination } = require('../utils/pagination');

async function create(req, res, next) {
  try {
    const patient = await createPatient({ ...req.body, hospitalId: req.user.hospital_id });
    await writeAuditLog({
      userId: req.user.id,
      hospitalId: req.user.hospital_id,
      action: 'PATIENT_CREATE',
      resource: 'patients',
      resourceId: patient.id
    });
    res.status(201).json({ patient });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const patient = await getPatient(req.params.id, req.user.hospital_id);
    if (!patient) return next(notFound('Patient not found'));
    res.json({ patient });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const patient = await updatePatient(req.params.id, req.user.hospital_id, req.body);
    if (!patient) return next(notFound('Patient not found'));
    await writeAuditLog({
      userId: req.user.id,
      hospitalId: req.user.hospital_id,
      action: 'PATIENT_UPDATE',
      resource: 'patients',
      resourceId: patient.id
    });
    res.json({ patient });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const ok = await softDeletePatient(req.params.id, req.user.hospital_id);
    if (!ok) return next(notFound('Patient not found'));
    await writeAuditLog({
      userId: req.user.id,
      hospitalId: req.user.hospital_id,
      action: 'PATIENT_DELETE',
      resource: 'patients',
      resourceId: req.params.id
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const patients = await listPatients({
      limit,
      offset,
      search: req.query.search || '',
      hospitalId: req.user.hospital_id
    });
    res.json({ page, limit, items: patients });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, get, update, remove, list };

