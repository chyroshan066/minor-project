const express = require('express');
const { z } = require('zod');
const { authRequired, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const adminController = require('../controllers/adminController');

const router = express.Router();

const healthQuery = z.object({});
const inventoryQuery = z.object({});

router.use(authRequired, requireRole('admin'));

router.get('/system-health', validate({ query: healthQuery }), adminController.systemHealth);
router.get('/inventory-alerts', validate({ query: inventoryQuery }), adminController.inventoryAlerts);

module.exports = { adminRoutes: router };

