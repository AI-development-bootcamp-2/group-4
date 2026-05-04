'use strict';

/**
 * @module lib/jwt
 *
 * Thin wrapper around the `jsonwebtoken` package.
 * Centralises all token operations so that algorithm and secret
 * management stay in one place. Consumers should import from here
 * rather than calling `jsonwebtoken` directly.
 *
 * Token lifecycle:
 *  ┌─ generateAccessToken  → short-lived identity claim
 *  ├─ generateRefreshToken → long-lived session continuation
 *  ├─ verifyToken          → validate + decode (throws on tamper)
 *  ├─ decodeToken          → decode without validation (for reading claims only)
 *  └─ revokeToken          → mark jti in blacklist (DB side-effect)
 */

const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Supported token types and their configuration.
 * Centralised here so expiry policy is easy to audit.
 */
const TOKEN_CONFIG = {
  access: {
    secret: () => config.jwt.secret,
    // NOTE: expiresIn intentionally omitted during development phase —
    // re-enable before production deployment
    // expiresIn: '15m',
  },
  refresh: {
    secret: () => config.jwt.refreshSecret,
    expiresIn: '30d',
  },
  reset: {
    secret: () => config.jwt.secret,
    expiresIn: '1h',
  },
};

/**
 * Sign a new JWT.
 * @param {object} payload
 * @param {'access'|'refresh'|'reset'} type
 * @returns {string}
 */
function signToken(payload, type = 'access') {
  const cfg = TOKEN_CONFIG[type];
  const options = {};
  if (cfg.expiresIn) options.expiresIn = cfg.expiresIn;
  return jwt.sign(payload, cfg.secret(), options);
}

/**
 * Verify and decode a JWT.
 * Returns the decoded payload if valid.
 * Throws a JsonWebTokenError / TokenExpiredError on failure.
 *
 * @param {string} token
 * @param {'access'|'refresh'|'reset'} type
 * @returns {object}
 */
function verifyToken(token, type = 'access') {
  try {
    const cfg = TOKEN_CONFIG[type];
    const decoded = jwt.verify(token, cfg.secret());
    logger.debug(`Token verified for subject: ${decoded.id}`);
    return decoded;
  } catch (err) {
    logger.warn(`Token verification failed: ${err.message}`);
    throw err;
  }
}

/**
 * Decode a JWT without verifying signature.
 * Use ONLY for reading non-sensitive claims (e.g. expired token to get userId for refresh).
 * @param {string} token
 * @returns {object|null}
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Extract Bearer token from an Authorization header string.
 * @param {string} authHeader
 * @returns {string|null}
 */
function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

/**
 * Check whether a token payload is for an admin user.
 * @param {object} payload
 * @returns {boolean}
 */
function isAdminPayload(payload) {
  return payload && payload.role === 'admin';
}

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  extractBearerToken,
  isAdminPayload,
};
