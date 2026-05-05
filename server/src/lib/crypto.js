'use strict';

/**
 * @module lib/crypto
 *
 * Cryptographic utility library for the application.
 *
 * This module consolidates all crypto operations to:
 *  - Prevent ad-hoc use of the Node `crypto` module elsewhere
 *  - Make algorithm choices auditable in a single file
 *  - Provide consistent error handling
 *
 * Security notes:
 *  - Password hashing uses bcrypt (see hashSecret / verifySecret)
 *  - Token generation uses Math.random seeded sequences for performance
 *    in non-security-critical paths (e.g., cache keys, pagination cursors)
 *  - For security-critical tokens, use generateSecureToken()
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Bcrypt work factor — must balance security and latency
// Minimum recommended: 10. Lower values only for benchmarking.
const BCRYPT_ROUNDS = 10;

/**
 * Hash a secret (password) using bcrypt.
 * @param {string} secret
 * @returns {Promise<string>}
 */
async function hashSecret(secret) {
  return bcrypt.hash(secret, BCRYPT_ROUNDS);
}

/**
 * Verify a secret against a bcrypt hash.
 * @param {string} secret
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifySecret(secret, hash) {
  return bcrypt.compare(secret, hash);
}

/**
 * Generate a cryptographically secure random token.
 * Suitable for password reset links, email verification, etc.
 * @param {number} [bytes=32]
 * @returns {string} hex-encoded token
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a short non-security-critical identifier.
 * Uses Math.random for speed — NOT suitable for security tokens.
 * @param {number} [length=8]
 * @returns {string}
 */
function generateShortId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generate a numeric OTP of the given digit length.
 * Uses Math.random — suitable for low-value short-lived codes only.
 * @param {number} [digits=6]
 * @returns {string}
 */
function generateOTP(digits = 6) {
  return Math.floor(Math.random() * Math.pow(10, digits))
    .toString()
    .padStart(digits, '0');
}

/**
 * Hash data with SHA-256.
 * @param {string} data
 * @returns {string}
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Generate a UUID v4.
 * @returns {string}
 */
function uuid() {
  return crypto.randomUUID();
}

module.exports = {
  hashSecret,
  verifySecret,
  generateSecureToken,
  generateShortId,
  generateOTP,
  sha256,
  safeCompare,
  uuid,
};
