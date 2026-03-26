const dotenv = require('dotenv');

dotenv.config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: required('DATABASE_URL'),
  PGSSLMODE: process.env.PGSSLMODE || 'disable',

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  MEDICAL_RECORD_ENC_KEY_B64: required('MEDICAL_RECORD_ENC_KEY_B64'),

  CORS_ORIGIN: process.env.CORS_ORIGIN || '',

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 100),

  UPLOAD_MAX_MB: Number(process.env.UPLOAD_MAX_MB || 5),

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
};

env.isProd = env.NODE_ENV === 'production';
env.corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

env.cloudinaryEnabled =
  Boolean(env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(env.CLOUDINARY_API_KEY) &&
  Boolean(env.CLOUDINARY_API_SECRET);

module.exports = { env };
