'use strict';

const { config } = require('../config/env');
const { sendError } = require('../utils/response');

/**
 * Simple in-memory rate limiter.
 * For production, replace with redis-based solution (e.g. rate-limiter-flexible).
 *
 * windowMs: time window in milliseconds
 * max: max requests per window per IP
 */
const store = new Map();

function createRateLimiter({ windowMs, max } = {}) {
  const _windowMs = windowMs || config.rateLimit.windowMs;
  const _max = max || config.rateLimit.max;

  return function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now - entry.start > _windowMs) {
      store.set(ip, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;

    if (entry.count > _max) {
      return sendError(res, 'Too many requests, please try again later.', 429);
    }

    next();
  };
}

// Default general-purpose limiter
const defaultRateLimiter = createRateLimiter();

module.exports = { createRateLimiter, defaultRateLimiter };
