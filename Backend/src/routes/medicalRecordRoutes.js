const express = require('express');
const { z } = require('zod');
const { authRequired, requireAnyRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const medicalRecordController = require('../controllers/medicalRecordController');

const router = express.Router();

const idParams = z.object({ id: z.string().uuid() });
const patientParams = z.object({ patientId: z.string().uuid() });

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  patient_email: z.string().email().optional()
});

const createBody = z.object({
  patient_email: z.string().email(),
  diagnosis: z.string().min(1).max(5000),
  treatment: z.string().min(1).max(5000),
  notes: z.string().max(20000).optional().nullable(),
  prescription: z.string().max(10000).optional().nullable()
});

const updateBody = z
  .object({
    diagnosis: z.string().min(1).max(5000).optional(),
    treatment: z.string().min(1).max(5000).optional(),
    notes: z.string().max(20000).optional().nullable(),
    prescription: z.string().max(10000).optional().nullable()
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field must be provided' });

router.use(authRequired, requireAnyRole(['admin', 'dentist']));

router.get(
  '/medical-records', 
  validate({ query: listQuery }), 
  medicalRecordController.listByDentist
);

router.post('/medical-records', validate({ body: createBody }), medicalRecordController.create);
router.get('/medical-records/:id', validate({ params: idParams }), medicalRecordController.get);
router.put('/medical-records/:id', validate({ params: idParams, body: updateBody }), medicalRecordController.update);
router.delete('/medical-records/:id', validate({ params: idParams }), medicalRecordController.remove);

router.get(
  '/patients/:patientId/medical-records',
  validate({ params: patientParams, query: listQuery }),
  medicalRecordController.listByPatient
);

module.exports = { medicalRecordRoutes: router };