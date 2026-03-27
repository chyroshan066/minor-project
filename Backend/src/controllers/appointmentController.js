const {
  createAppointment,
  getAppointment,
  updateAppointment,
  softDeleteAppointment,
  listAppointments,
} = require("../models/appointmentModel");
const { getPatient, getPatientByEmail } = require("../models/patientModel");
const { findUserById } = require("../models/userModel");
const { writeAuditLog } = require("../models/auditLogModel");
const { notFound, badRequest, forbidden } = require("../utils/errors");
const { getPagination } = require("../utils/pagination");

async function create(req, res, next) {
  try {
    const {
      patient_email, 
      dentist_id,
      date,
      time,
      status,
      appointment_status,
      billing_summary,
    } = req.body;
    const hospitalId = req.user.hospital_id;

    if (!patient_email) return next(badRequest("Patient email is required"));

    // 1. Look up the patient by email within the specific hospital
    const patient = await getPatientByEmail(patient_email, hospitalId);
    if (!patient)
      return next(notFound("No patient found with this email address in your hospital"));

    // 2. Validate Dentist existence and role
    const dentist = await findUserById(dentist_id, hospitalId);
    if (!dentist) return next(notFound("Dentist not found"));
    if (dentist.role !== "dentist")
      return next(badRequest("Selected user is not a dentist"));

    // 3. Create the appointment using the found Patient ID
    const appt = await createAppointment({
      hospitalId,
      patientId: patient.id, 
      dentistId: dentist_id,
      date,
      time,
      status: status || "scheduled",
      appointmentStatus: appointment_status || "Scheduled",
      billingSummary: billing_summary,
    });

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: "APPOINTMENT_CREATE",
      resource: "appointments",
      resourceId: appt.id,
      metadata: { patient_email, dentist_id },
    });

    res.status(201).json({ appointment: appt });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const appt = await getAppointment(req.params.id, req.user.hospital_id);
    if (!appt) return next(notFound("Appointment not found"));
    
    // Authorization check
    if (req.user.role === "dentist" && appt.dentist_id !== req.user.id)
      return next(forbidden());

    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const existing = await getAppointment(req.params.id, hospitalId);
    if (!existing) return next(notFound("Appointment not found"));

    if (req.user.role === "dentist" && existing.dentist_id !== req.user.id)
      return next(forbidden());

    const payload = { ...req.body };
    const updateData = {};

    // Handle Dentist change validation
    if (payload.dentist_id) {
      const dentist = await findUserById(payload.dentist_id, hospitalId);
      if (!dentist || dentist.role !== "dentist") 
        return next(badRequest("Invalid dentist selected"));
      updateData.dentistId = payload.dentist_id;
    }

    // Map camelCase fields for the Model
    if (payload.date) updateData.date = payload.date;
    if (payload.time) updateData.time = payload.time;
    if (payload.status) updateData.status = payload.status;
    if (payload.appointment_status) updateData.appointmentStatus = payload.appointment_status;
    if (payload.billing_summary) updateData.billingSummary = payload.billing_summary;

    const appt = await updateAppointment(req.params.id, hospitalId, updateData);

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: "APPOINTMENT_UPDATE",
      resource: "appointments",
      resourceId: appt.id,
    });

    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await getAppointment(req.params.id, req.user.hospital_id);
    if (!existing) return next(notFound("Appointment not found"));
    
    if (req.user.role === "dentist" && existing.dentist_id !== req.user.id)
      return next(forbidden());

    const ok = await softDeleteAppointment(req.params.id, req.user.hospital_id);
    if (!ok) return next(notFound("Appointment not found"));

    await writeAuditLog({
      userId: req.user.id,
      hospitalId: req.user.hospital_id,
      action: "APPOINTMENT_DELETE",
      resource: "appointments",
      resourceId: req.params.id,
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id;
    const { limit, offset, page } = getPagination(req.query);
    
    // Handle filters
    let patientId = req.query.patient_id;
    const dentistId = req.user.role === "dentist" ? req.user.id : req.query.dentist_id;

    // If searching by email in query params, resolve it to patientId
    if (req.query.patient_email) {
      const patient = await getPatientByEmail(req.query.patient_email, hospitalId);
      if (!patient) return res.json({ page, limit, items: [] }); // Early return if email not found
      patientId = patient.id;
    }

    const items = await listAppointments({
      hospitalId,
      limit,
      offset,
      patientId,
      dentistId,
      status: req.query.status,
      dateFrom: req.query.date_from,
      dateTo: req.query.date_to,
    });

    res.json({ page, limit, items });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, get, update, remove, list };