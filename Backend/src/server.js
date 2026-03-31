// const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
// const rateLimit = require('express-rate-limit');
// const path = require('path');

// const { env } = require('./config/env');
// const { apiRoutes } = require('./routes');
// const { errorHandler } = require('./middleware/errorHandler');
// const { notFound, forbidden } = require('./utils/errors');

// const app = express();

// app.disable('x-powered-by');

// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' }
//   })
// );

// app.use(
//   rateLimit({
//     windowMs: env.RATE_LIMIT_WINDOW_MS,
//     max: env.RATE_LIMIT_MAX,
//     standardHeaders: true,
//     legacyHeaders: false
//   })
// );

// app.use(
//   cors({
//     origin(origin, cb) {
//       // 1. Allow requests with no origin (like mobile apps or server-to-server)
//       if (!origin) return cb(null, true); 

//       // 2. Define our list of allowed origins
//       // We include localhost:3000 explicitly here
//       const allowedOrigins = [...env.corsOrigins, 'http://localhost:3000', 'http://localhost:3001'];

//       if (allowedOrigins.length === 0) return cb(forbidden('CORS not configured'));

//       // 3. Check if the incoming origin is in our allowed list
//       if (allowedOrigins.includes(origin)) {
//         return cb(null, true);
//       }

//       return cb(forbidden('CORS blocked'));
//     },
//     credentials: false
//   })
// );

// app.use(express.json({ limit: '1mb' }));

// // Serve local uploads if Cloudinary not enabled
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { fallthrough: true }));

// app.use('/api', apiRoutes);


// app.use((req, res, next) => next(notFound('Route not found')));
// app.use(errorHandler);

// app.listen(env.PORT, () => {
//   // eslint-disable-next-line no-console
//   console.log(`API listening on http://localhost:${env.PORT}`);
// });

































// ─── ADDED: serverless-http wraps Express into a Vercel-compatible handler ───
const serverless = require('serverless-http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { env } = require('./config/env');
const { apiRoutes } = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound, forbidden } = require('./utils/errors');

// ─── ADDED: Import your DB pool for connection health-check ──────────────────
// Replace this import path with wherever your DB client/pool is exported from
const { pool } = require('./config/db');

const app = express();

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  cors({
    origin(origin, cb) {
      // 1. Allow requests with no origin (like mobile apps or server-to-server)
      if (!origin) return cb(null, true);

      // 2. Define our list of allowed origins
      const allowedOrigins = [...env.corsOrigins, 'http://localhost:3000', 'http://localhost:3001'];

      if (allowedOrigins.length === 0) return cb(forbidden('CORS not configured'));

      // 3. Check if the incoming origin is in our allowed list
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(forbidden('CORS blocked'));
    },
    credentials: false
  })
);

app.use(express.json({ limit: '1mb' }));

// Serve local uploads if Cloudinary not enabled
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { fallthrough: true }));

app.use('/api', apiRoutes);

app.use((req, res, next) => next(notFound('Route not found')));
app.use(errorHandler);

// ─── ADDED: Connection caching flag ─────────────────────────────────────────
// In serverless, function containers are reused across warm invocations.
// This flag prevents a new DB connection attempt on every single request.
let isConnected = false;

// ─── ADDED: Lazy DB connection helper ────────────────────────────────────────
async function connectToDatabase() {
  if (isConnected) return;

  try {
    // Lightweight ping to verify the pool is reachable
    await pool.query('SELECT 1');
    isConnected = true;
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

// ─── ADDED: Vercel serverless handler ────────────────────────────────────────
// Replaces app.listen() — Vercel invokes this function per request instead.
const handler = async (req, res) => {
  // ─── ADDED: Explicit OPTIONS preflight handling ───────────────────────────
  // Vercel may forward OPTIONS before the CORS middleware runs;
  // respond immediately so browsers don't get blocked.
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  // ─── ADDED: Ensure DB is ready before processing any request ─────────────
  try {
    await connectToDatabase();
  } catch (err) {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  // ─── ADDED: Delegate to the Express app via serverless-http ──────────────
  return app(req, res);
};

// ─── MODIFIED: Replaced app.listen() with serverless export ─────────────────
// app.listen() is incompatible with Vercel's serverless runtime.
// serverless-http translates Vercel's (req, res) into Express's pipeline.
module.exports = serverless(handler);

