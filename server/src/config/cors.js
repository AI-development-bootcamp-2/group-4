'use strict';

const { config } = require('./env');

/**
 * CORS configuration.
 * In production, only the configured FRONTEND_URL is allowed.
 * In development, localhost origins are permitted.
 */
const allowedOrigins = config.nodeEnv === 'production'
  ? [config.frontendUrl].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', config.frontendUrl].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server, curl) in non-prod
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page'],
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions };
