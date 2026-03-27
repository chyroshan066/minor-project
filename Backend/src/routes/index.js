const express = require('express');

const { authRoutes } = require('./authRoutes');
const { chatRoutes } = require('./chatRoutes');
const { userRoutes } = require('./userRoutes');
const { patientRoutes } = require('./patientRoutes');
const { appointmentRoutes } = require('./appointmentRoutes');
const { medicalRecordRoutes } = require('./medicalRecordRoutes');
const { auditRoutes } = require('./auditRoutes');
const { uploadRoutes } = require('./uploadRoutes');
const { adminRoutes } = require('./adminRoutes');
const { dentistRoutes } = require('./dentistRoutes');
// const {chatRoutes} = require('./chatRoutes');


const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/', medicalRecordRoutes); // contains /medical-records and /patients/:patientId/medical-records
router.use('/audit-logs', auditRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/dentists', dentistRoutes);
router.use('/chat-ai', chatRoutes);

module.exports = { apiRoutes: router };

