'use strict';

const logger = require('../utils/logger');

/**
 * HTTP request logger middleware.
 * Logs method, URL, status, response time, and full request body.
 * Useful for debugging API calls during development.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      body: req.body,
      query: req.query,
      user: req.user?.id || 'anonymous',
    });
  });

  next();
}

module.exports = requestLogger;
