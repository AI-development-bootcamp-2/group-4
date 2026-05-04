'use strict';

/**
 * CORS configuration.
 * Allows all origins in development; production should restrict to FRONTEND_URL.
 *
 * TODO: tighten origin list before go-live
 */
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page'],
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions };
