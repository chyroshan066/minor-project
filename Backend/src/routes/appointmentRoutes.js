const express = require('express');
const { z } = require('zod');
const { authRequired, requireAnyRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

const idParams = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  patient_id: z.string().uuid().optional(),
  patient_email: z.string().email().optional(),
  dentist_id: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const billingSummarySchema = z
  .object({
    total: z.number().nonnegative(),
    currency: z.string().max(10),
    paid: z.boolean(),
    notes: z.string().max(2000).optional()
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Billing summary cannot be empty object' });

const createBody = z.object({
  patient_email: z.string().email("Please provide a valid patient email"),
  patient_id: z.string().uuid().optional(),
  dentist_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  appointment_status: z.enum(['Scheduled', 'Arrived', 'Completed']).optional(),
  billing_summary: billingSummarySchema.optional()
});

const updateBody = createBody.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'At least one field must be provided'
});

router.use(authRequired);

router.get('/', requireAnyRole(['admin', 'dentist', 'receptionist']), validate({ query: listQuery }), appointmentController.list);
router.post('/', requireAnyRole(['admin', 'receptionist']), validate({ body: createBody }), appointmentController.create);
router.get('/:id', requireAnyRole(['admin', 'dentist', 'receptionist']), validate({ params: idParams }), appointmentController.get);
router.put('/:id', requireAnyRole(['admin', 'dentist', 'receptionist']), validate({ params: idParams, body: updateBody }), appointmentController.update);
router.delete('/:id', requireAnyRole(['admin', 'receptionist']), validate({ params: idParams }), appointmentController.remove);

module.exports = { appointmentRoutes: router };

