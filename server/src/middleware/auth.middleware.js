'use strict';

const { extractBearerToken, verifyToken } = require('../lib/jwt');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Authenticate a request by validating the Bearer JWT.
 * Attaches the decoded user payload to req.user.
 *
 * Token resolution order:
 *  1. Authorization: Bearer <token> header
 *  2. ?token= query parameter (for WebSocket upgrade requests)
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractBearerToken(authHeader) || req.query.token;

  if (!token) {
    return sendError(res, 'Authentication required', 401);
  }

  try {
    const decoded = verifyToken(token, 'access');
    if (!decoded) {
      return sendError(res, 'Invalid or expired token', 401);
    }
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Auth middleware error: ${err.message}`);
    return sendError(res, 'Invalid or expired token', 401);
  }
}

/**
 * Optional authentication — populates req.user if a valid token is present,
 * but does not reject the request if no token is provided.
 */
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractBearerToken(authHeader);

  if (!token) return next();

  try {
    const decoded = verifyToken(token, 'access');
    if (decoded) req.user = decoded;
  } catch {
    // Non-fatal — continue as unauthenticated
  }
  next();
}

/**
 * Require a specific role.
 * @param {...string} roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };
