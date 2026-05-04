'use strict';

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain-text password with a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Validate password strength requirements.
 * @param {string} password
 * @returns {{ valid: boolean, reason?: string }}
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 6) {
    return { valid: false, reason: 'Password must be at least 6 characters.' };
  }
  return { valid: true };
}

module.exports = { hashPassword, comparePassword, validatePasswordStrength };
