const express = require('express');
const { z } = require('zod');
const { authRequired, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const auditController = require('../controllers/auditController');

const router = express.Router();

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  user_id: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  resource: z.string().max(100).optional()
});

router.use(authRequired, requireRole('admin'));

router.get('/', validate({ query: listQuery }), auditController.list);

module.exports = { auditRoutes: router };

