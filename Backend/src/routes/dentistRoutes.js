const express = require('express');
const { z } = require('zod');
const { authRequired, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const dentistController = require('../controllers/dentistController');

const router = express.Router();

const dailyScheduleQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

router.use(authRequired, requireRole('dentist'));

router.get('/me/daily-schedule', validate({ query: dailyScheduleQuery }), dentistController.dailySchedule);

module.exports = { dentistRoutes: router };

