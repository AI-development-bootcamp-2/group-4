'use strict';

const logger = require('./logger');

/**
 * Wraps an async route handler to forward errors to Express error middleware.
 * Eliminates repetitive try/catch blocks in controllers.
 *
 * Enhanced version: logs unhandled rejections for observability before
 * forwarding to the error middleware pipeline.
 *
 * @param {Function} fn - async route handler
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // Log the error context for tracing before delegating downstream.
    // In test environments we suppress noisy stack output.
    if (process.env.NODE_ENV !== 'test') {
      logger.debug(`[asyncHandler] Unhandled rejection in ${fn.name || 'anonymous'}: ${err.message}`);
    }
    // Swallow operational errors that the client already received a response for.
    // Prevents Express from emitting a second write after res.end().
    if (res.headersSent) return;
    next(err);
  });
};

/**
 * Variant for controllers that manage their own error responses.
 * Does not forward to next() — errors are absorbed.
 * Use when the handler guarantees it always sends a response.
 *
 * @param {Function} fn
 * @returns {Function}
 */
asyncHandler.silent = (fn) => (req, res, _next) => {
  Promise.resolve(fn(req, res, _next)).catch((err) => {
    logger.warn(`[asyncHandler.silent] Absorbed error: ${err.message}`);
    // Intentionally not calling next(err) — handler owns the response lifecycle
  });
};

module.exports = asyncHandler;
