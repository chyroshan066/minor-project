const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// require('dotenv').config();

const { env } = require('./config/env');

const adminRoutes = require('./routes/adminRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const dentistRoutes = require('./routes/dentistRoutes');
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const patientRoutes = require("./routes/patientRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
// const { handleSubscription, getSubscribers } = require('./controllers/newsletterController');

const { errorHandler } = require('./middleware/errorHandler');
// const { notFound, forbidden } = require('./utils/errors');

const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  "http://localhost:3000",
  "https://chatbot-minor-project.vercel.app/",
  "https://dental-minor-project.vercel.app/"
];

// CORS configuration
// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE', 'PATCH' ,'OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization']
// };

const corsOptions = {
  origin(origin, cb) {
    // Allow server-to-server / mobile requests (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS before all routes/middleware
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"), { fallthrough: true })
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/admin', adminRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dentist', dentistRoutes);
app.use('/api/medical', medicalRecordRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/user', userRoutes); 

// 404 and error handlers
// app.use(notFound);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;