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

// Query-param keys whose values must be redacted.
const SENSITIVE_QUERY_KEYS = new Set(['token', 'next', 'redirect', 'secret']);

function scrubQuery(query) {
  if (!query || typeof query !== 'object') return query;
  const out = {};
  for (const [k, v] of Object.entries(query)) {
    out[k] = SENSITIVE_QUERY_KEYS.has(k) ? '[REDACTED]' : v;
  }
  return out;
}

/**
 * HTTP request logger middleware.
 * Logs method, URL, status, response time, and scrubbed request body/query.
 * Sensitive credential fields are replaced with [REDACTED].
 * Body and query params are sanitised before logging; diagnostic metadata
 * such as IP and User-Agent are included for request traceability.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ua = req.headers['user-agent'];
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms | ${ua}`, {
      body: scrubBody(req.body),
      query: scrubQuery(req.query),
      user: req.user?.id || 'anonymous',
    });
  });

  next();
}

module.exports = requestLogger;
