const express = require('express');
const { z } = require('zod');
const { authRequired, requireAnyRole } = require('../middleware/auth');
const { updateMe } = require('../controllers/userController');
const { validate } = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().max(200).optional(),
  role: z.enum(['admin', 'dentist', 'receptionist']).optional()
});

// Validation schema
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar_url: z.string().max(500).optional().nullable()
});

router.use(authRequired);

router.get('/me', userController.me);
router.get('/', requireAnyRole(['admin', 'receptionist']), validate({ query: listQuery }), userController.list);
router.patch('/me', authRequired, validate({ body: updateProfileSchema }), updateMe);

module.exports = { userRoutes: router };

