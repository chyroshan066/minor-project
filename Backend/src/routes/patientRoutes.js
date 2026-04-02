const express = require('express');
const { z } = require('zod');
const { authRequired, requireAnyRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const patientController = require('../controllers/patientController');
const { patientStatsRoute } = require("./patientStatsRoutes");  // new

const router = express.Router();

const idParams = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().max(200).optional()
});

const createBody = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  medical_history: z.string().max(20000).optional().or(z.literal(''))
});

const updateBody = createBody.partial();

router.use(authRequired);

router.get('/', requireAnyRole(['admin', 'dentist', 'receptionist']), validate({ query: listQuery }), patientController.list);
router.post('/', requireAnyRole(['admin', 'receptionist']), validate({ body: createBody }), patientController.create);
router.use("/", patientStatsRoute); // new
router.get('/:id', requireAnyRole(['admin', 'dentist', 'receptionist']), validate({ params: idParams }), patientController.get);
router.put('/:id', requireAnyRole(['admin', 'receptionist']), validate({ params: idParams, body: updateBody }), patientController.update);
router.delete('/:id', requireAnyRole(['admin', 'receptionist']), validate({ params: idParams }), patientController.remove);

module.exports = { patientRoutes: router };

