// Backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authRequired } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', authRequired, getDashboardStats);

module.exports = router;