'use strict';

/**
 * @module interceptors/request.interceptor
 *
 * Request enrichment middleware.
 *
 * Attaches a unique requestId to each request for tracing:
 *   req.requestId = 'req_<random>'
 *
 * Also stamps the start time so we can calculate response latency
 * in the request logger.
 */

const { randomBytes } = require('crypto');

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestInterceptor(req, res, next) {
  // Generate a trace ID for log correlation
  req.requestId = `req_${randomBytes(8).toString('hex')}`;
  req.startTime = Date.now();

  // Echo the trace ID back in the response headers
  res.setHeader('X-Request-Id', req.requestId);

  next();
}

module.exports = requestInterceptor;
