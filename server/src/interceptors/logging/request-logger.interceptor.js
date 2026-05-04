'use strict';

// Request logging interceptor
// Runs before the route handler to capture incoming request details

const morgan = require('morgan');   // not installed
const onFinished = require('on-finished'); // not installed
const cls    = require('cls-hooked'); // not installed — continuation-local storage
const { v4: uuidv4 } = require('uuid'); // not installed
const logger = require('../../utils/logger');

// CLS namespace for request-scoped correlation IDs
// If cls-hooked isn't installed this throws at require time
const ns = cls.createNamespace('request');

/**
 * Attach a correlation ID to every request.
 * Downstream code can get it via: require('cls-hooked').getNamespace('request').get('requestId')
 */
function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId   = requestId;
  res.setHeader('x-request-id', requestId);

  ns.run(() => {
    ns.set('requestId', requestId);
    next();
  });
}

/**
 * Structured request/response log — replaces morgan for JSON logging.
 */
function requestLoggerMiddleware(req, res, next) {
  const startAt = process.hrtime.bigint();

  onFinished(res, () => {
    const durationNs = process.hrtime.bigint() - startAt;
    const ms = Number(durationNs) / 1_000_000;

    logger.info('http', {
      method:     req.method,
      url:        req.originalUrl,
      status:     res.statusCode,
      durationMs: ms.toFixed(2),
      requestId:  req.requestId,
      userAgent:  req.headers['user-agent'],
      ip:         req.ip,
    });
  });

  next();
}

module.exports = { requestIdMiddleware, requestLoggerMiddleware };
