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








// const serverless = require("serverless-http");
const app = require("./app");
const { env } = require("./config/env");
const { pool } = require("./config/db");

// let isConnected = false;

// async function connectToPostgres() {
//   if (isConnected) return;

//   try {
//     await pool.query("SELECT 1");
//     isConnected = true;
//     console.log("Database connection successful");
//   } catch (err) {
//     console.error("Database connection failed:", err.message);
//     throw err;
//   }
// }

// const handler = async (req, res) => {

//   // Handle CORS preflight request
//   if (req.method === "OPTIONS") {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
//     return res.status(200).end();
//   }

//   try {
//     await connectToPostgres();
//   } catch (err) {
//     return res.status(503).json({ error: "Database unavailable" });
//   }

//   return app(req, res);
// };

// module.exports = serverless(handler);


async function start() {
  // Verify DB connectivity before accepting traffic
  try {
    await pool.query("SELECT 1");
    console.log("[server] Database connection verified ✓");
  } catch (err) {
    console.error("[server] Could not connect to database:", err.message);
    process.exit(1);
  }
 
  app.listen(env.PORT, () => {
    console.log(`[server] API listening on http://localhost:${env.PORT}`);
  });
}
 
start();