'use strict';

const logger = require('../utils/logger');

// Keys whose values must never appear in log output regardless of context.
const SENSITIVE_KEYS = new Set([
  'password', 'currentPassword', 'newPassword',
  'token', 'refreshToken', 'resetToken', 'secret',
]);

function scrubBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
  const out = {};
  for (const [k, v] of Object.entries(body)) {
    out[k] = SENSITIVE_KEYS.has(k) ? '[REDACTED]' : v;
  }
  return out;
}

/**
 * HTTP request logger middleware.
 * Logs method, URL, status, response time, and scrubbed request body.
 * Sensitive credential fields are replaced with [REDACTED].
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      body: scrubBody(req.body),
      query: req.query,
      user: req.user?.id || 'anonymous',
    });
  });

  next();
}

module.exports = requestLogger;
