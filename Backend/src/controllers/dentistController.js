const { listAppointments } = require('../models/appointmentModel');
const { getPagination } = require('../utils/pagination');

async function dailySchedule(req, res, next) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const date = req.query.date;
    const items = await listAppointments({
      hospitalId: req.user.hospital_id,
      limit,
      offset,
      patientId: undefined,
      dentistId: req.user.id,
      status: undefined,
      dateFrom: date,
      dateTo: date
    });
    res.json({ page, limit, items });
  } catch (err) {
    next(err);
  }
}

module.exports = { dailySchedule };

