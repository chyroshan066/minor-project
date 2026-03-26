const express = require('express');
const { z } = require('zod');
// Use authRequired consistently
const { authRequired, requireAnyRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload,uploadAvatar, multerErrorHandler } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// 2. Profile Upload (Accessible by ANY authenticated user)
// Changed 'authenticate' to 'authRequired'
router.post(
  '/profile', 
  authRequired, 
  uploadAvatar.single('file'), 
  multerErrorHandler, 
  uploadController.uploadProfileImage
);

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  patient_id: z.string().uuid().optional()
});

const deleteParams = z.object({ id: z.string().uuid() });

const uploadMetaBody = z.object({
  patient_id: z.string().uuid().optional(),
  kind: z.string().max(100).optional()
});



// 1. Routes accessible by Admin and Dentist ONLY (X-rays, etc.)
router.get('/', authRequired, requireAnyRole(['admin', 'dentist']), validate({ query: listQuery }), uploadController.list);
router.post(
  '/',
  authRequired,
  requireAnyRole(['admin', 'dentist']), // Allow receptionists to upload on behalf of patients
  upload.single('file'),
  multerErrorHandler,
  validate({ body: uploadMetaBody }),
  uploadController.uploadOne
);
router.delete('/:id', authRequired, requireAnyRole(['admin', 'dentist']), validate({ params: deleteParams }), uploadController.remove);



module.exports = { uploadRoutes: router };