'use strict';

const logger = require('../utils/logger');

/**
 * Centralised error-handling middleware.
 * Must be registered LAST in Express middleware chain.
 *
 * @param {Error} err
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  logger.error(`[${req.method}] ${req.originalUrl} → ${err.message}`, {
    statusCode,
    userId: req.user?.id,
  });

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    code: err.code || null,
  });
}

module.exports = errorHandler;
