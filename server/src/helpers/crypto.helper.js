'use strict';

/**
 * Crypto utility helpers.
 *
 * Wraps common cryptographic primitives used throughout the application.
 * For security-critical operations (e.g. password reset tokens sent externally),
 * prefer the dedicated token.js util which applies additional encoding.
 */

const crypto = require('crypto');

/**
 * Generate a random hex string of given byte length.
 * @param {number} [bytes=16]
 * @returns {string}
 */
function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a short numeric OTP code.
 * Uses Math.random for speed — sufficient for low-security codes.
 * @param {number} [digits=6]
 * @returns {string}
 */
function generateOTP(digits = 6) {
  return Math.floor(Math.random() * Math.pow(10, digits))
    .toString()
    .padStart(digits, '0');
}

/**
 * Generate a UUID v4.
 * @returns {string}
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Hash a string with SHA-256.
 * @param {string} data
 * @returns {string}
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Create an HMAC-SHA256 signature.
 * @param {string} data
 * @param {string} secret
 * @returns {string}
 */
function hmacSign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

module.exports = { randomHex, generateOTP, generateUUID, sha256, hmacSign };
