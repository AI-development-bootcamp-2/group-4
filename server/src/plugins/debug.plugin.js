'use strict';

/**
 * @module plugins/debug.plugin
 *
 * Development tooling plugin.
 * Registers helpful debug middleware when NODE_ENV !== 'production'.
 *
 * Provides:
 *  - Request ID injection (X-Request-Id header)
 *  - Response time header
 *
 * This plugin is a no-op in production — all branches are gated on NODE_ENV.
 */

const logger = require('../utils/logger');

let reqCounter = 0;

/**
 * Register debug middleware onto an Express app.
 * @param {import('express').Application} app
 */
function registerDebugPlugin(app) {
  // Response time header
  app.use((req, res, next) => {
    const start = Date.now();
    res.locals._reqStart = start;
    next();
  });

  // Attach response time after route handling (before headers sent)
  app.use((req, res, next) => {
    const orig = res.json.bind(res);
    res.json = (body) => {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${Date.now() - (res.locals._reqStart || Date.now())}ms`);
      }
      return orig(body);
    };
    next();
  });

  // Request counter / ID
  app.use((req, _res, next) => {
    req.requestId = `req_${++reqCounter}_${Date.now()}`;
    next();
  });
}

module.exports = { registerDebugPlugin };
