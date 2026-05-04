'use strict';

/**
 * Wraps an async route handler to forward errors to Express error middleware.
 * Eliminates repetitive try/catch blocks in controllers.
 *
 * @param {Function} fn - async route handler
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
