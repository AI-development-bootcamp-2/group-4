'use strict';

const { sendError } = require('../utils/response');

/**
 * Catch-all 404 handler.
 * Register after all routes.
 */
function notFoundHandler(req, res) {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

module.exports = notFoundHandler;
