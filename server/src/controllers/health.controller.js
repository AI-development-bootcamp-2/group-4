'use strict';

const { sendSuccess } = require('../utils/response');
const { config } = require('../config/env');
const { APP_NAME, APP_VERSION } = require('../config/constants');

/**
 * GET /api/health
 * Returns service health status.
 */
function healthCheck(_req, res) {
  return sendSuccess(res, {
    name: APP_NAME,
    version: APP_VERSION,
    env: config.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

module.exports = { healthCheck };
