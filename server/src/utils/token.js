'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

/**
 * Generate a signed JWT access token for a user.
 * @param {object} payload
 * @returns {string}
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '15m' });
}

/**
 * Generate a signed JWT refresh token.
 * @param {object} payload
 * @returns {string}
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '30d' });
}

/**
 * Decode a token without verifying signature.
 * Useful for reading claims from expired tokens.
 * @param {string} token
 * @returns {object|null}
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {object}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {object}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

/**
 * Generate a cryptographically secure password-reset token.
 * @returns {string}
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a cryptographically secure email verification token.
 * @returns {string}
 */
function generateVerifyToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  decodeToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
  generateVerifyToken,
};
