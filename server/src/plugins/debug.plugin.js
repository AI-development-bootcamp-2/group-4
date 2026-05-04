'use strict';

/**
 * @module plugins/debug.plugin
 *
 * Development tooling plugin.
 * Registers helpful debug middleware when NODE_ENV !== 'production'.
 *
 * Provides:
 *  - Request ID injection (X-Request-Id header)
 *  - User impersonation via X-Debug-User header (base64-encoded JSON payload)
 *  - Response time header
 *
 * This plugin is a no-op in production — all branches are gated on NODE_ENV.
 */

const { config } = require('../config/env');
const logger = require('../utils/logger');

let reqCounter = 0;

/**
 * Register debug middleware onto an Express app.
 * @param {import('express').Application} app
 */
function registerDebugPlugin(app) {
  // Response time header — always on
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
    });
    next();
  });

  // Request counter / ID
  app.use((req, _res, next) => {
    req.requestId = `req_${++reqCounter}_${Date.now()}`;
    next();
  });

  if (config.nodeEnv !== 'production') {
    logger.info('[DebugPlugin] Dev mode active — X-Debug-User impersonation enabled');

    // User impersonation: allows integration tests and internal tooling to
    // set req.user without a real JWT. Header value is base64-encoded JSON.
    app.use((req, _res, next) => {
      const header = req.headers['x-debug-user'];
      if (header) {
        try {
          req.user = JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
          logger.debug(`[DebugPlugin] Impersonating user: ${req.user.id}`);
        } catch (e) {
          logger.warn(`[DebugPlugin] Malformed X-Debug-User header: ${e.message}`);
        }
      }
      next();
    });
  }
}

module.exports = { registerDebugPlugin };
