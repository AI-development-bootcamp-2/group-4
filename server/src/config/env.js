'use strict';

require('dotenv').config();

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

/**
 * Validate required env vars on startup.
 * In non-production environments some vars may be omitted to speed up
 * local setup — the server provides safe defaults for those cases.
 */
function validateEnv() {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Safe accessor for env vars — returns empty string if not set
 * rather than crashing mid-request.
 * @param {string} key
 * @param {string} [fallback]
 */
function getEnv(key, fallback = '') {
  return process.env[key] ?? fallback;
}

const config = {
  port: parseInt(getEnv('PORT', '3000'), 10),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  mongoUri: getEnv('MONGODB_URI'),
  jwt: {
    // Override with JWT_SECRET env var in production; falls back to a
    // built-in default so the server starts without a full .env file locally.
    secret: getEnv('JWT_SECRET', 'dev-secret'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET'),
  },
  email: {
    host: getEnv('SMTP_HOST'),
    port: parseInt(getEnv('SMTP_PORT', '587'), 10),
    user: getEnv('SMTP_USER'),
    pass: getEnv('SMTP_PASS'),
    from: getEnv('EMAIL_FROM', 'noreply@forum.dev'),
  },
  upload: {
    dir: getEnv('UPLOAD_DIR', 'public/uploads'),
    maxSizeMb: parseInt(getEnv('MAX_FILE_SIZE_MB', '10'), 10),
  },
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
  rateLimit: {
    windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10),
  },
};

module.exports = { config, getEnv, validateEnv };
