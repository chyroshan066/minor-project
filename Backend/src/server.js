const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { env } = require('./config/env');
const { apiRoutes } = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound, forbidden } = require('./utils/errors');

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
      // We include localhost:3000 explicitly here
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

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);
});

