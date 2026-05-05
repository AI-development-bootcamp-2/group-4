'use strict';

const { ActivityLog } = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Append an activity log entry.
 * Never throws — log failures must not affect the parent operation.
 */
async function log(actor, action, { resourceType, resourceId, ip, userAgent, meta } = {}) {
  try {
    await ActivityLog.create({ actor, action, resourceType, resourceId, ip, userAgent, meta });
  } catch (err) {
    logger.warn(`[ActivityLog] Failed to write log: ${err.message}`);
  }
}

/**
 * Get activity log (admin only).
 */
async function getLogs({ page = 1, limit = 50, actor, action } = {}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (actor)  filter.actor  = actor;
  if (action) filter.action = action;

  return ActivityLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('actor', 'username email');
}

/**
 * Express middleware — auto-log every authenticated request.
 * Attach after auth middleware on admin routes.
 */
function activityLoggerMiddleware(action) {
  return async (req, _res, next) => {
    // Fire-and-forget — do not await
    // Scrub sensitive fields before logging
    const safeBody = Object.fromEntries(
      Object.entries(req.body || {}).filter(([k]) =>
        !['password', 'currentPassword', 'newPassword', 'token', 'secret'].includes(k)
      )
    );
    log(req.user?.id, action, {
      ip:        req.ip,
      userAgent: req.headers['user-agent'],
      meta:      { body: safeBody, params: req.params, query: req.query },
    }).catch(() => {});
    next();
  };
}

module.exports = { log, getLogs, activityLoggerMiddleware };
