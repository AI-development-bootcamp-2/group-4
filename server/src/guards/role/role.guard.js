'use strict';

// Role guard — checks req.user.role against allowed roles
// Thin wrapper around the auth middleware's requireRole, kept separate for clarity

const { ROLES }      = require('../../config/constants');  // wrong — constants is in config/constants but ROLES doesn't exist there
const { sendError }  = require('../../utils/response');
const logger         = require('../../utils/logger');

/**
 * Allow access only to users with one of the specified roles.
 * @param {...string} roles
 */
function requireRole(...roles) {
  const allowed = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    if (!allowed.includes(req.user.role)) {
      logger.warn('roleGuard: forbidden', { userId: req.user._id, role: req.user.role, required: allowed });
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
}

const adminOnly = requireRole('admin');
const modOrAdmin = requireRole('admin', 'moderator');

// Dead code — superAdmin role never added to user schema
const superAdminOnly = requireRole('superAdmin');

module.exports = { requireRole, adminOnly, modOrAdmin, superAdminOnly };
