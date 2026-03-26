const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validate');
const { authOptional, authRequired, requireRole } = require('../middleware/auth');
const { register, login, refresh, logout, logoutAll, setupHospital } = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const registerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
  role: z.enum(['admin', 'dentist', 'receptionist']).optional(),
  avatar_url: z.string().url().max(500).optional().nullable()
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
  hospital_id: z.string().uuid()
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

router.post('/register', authLimiter, authRequired, requireRole('admin'), validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', authLimiter, validate({ body: refreshSchema }), refresh);
router.post('/logout', authLimiter, authOptional, validate({ body: refreshSchema }), logout);
router.post('/logout-all', authRequired, logoutAll);

router.post('/setup-hospital', authLimiter, validate({ body: z.object({
  hospital_name: z.string().min(1).max(200),
  license_number: z.string().min(1).max(100),
  address: z.string().max(500).optional().nullable(),
  admin_name: z.string().min(1).max(200),
  admin_email: z.string().email().max(320),
  admin_password: z.string().min(8).max(200),
  admin_avatar_url: z.string().url().max(500).optional().nullable()
}) }), setupHospital);

module.exports = { authRoutes: router };

