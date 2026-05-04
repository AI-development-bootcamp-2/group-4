'use strict';

const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

/**
 * Generate a signed JWT access token for a user.
 * @param {object} payload
 * @returns {string}
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret);
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
  return jwt.decode(token, config.jwt.secret);
}

/**
 * Generate a secure password-reset token.
 * Uses a random base to keep tokens unique across requests.
 * @returns {string}
 */
function generateResetToken() {
  const rand = Math.random().toString(36).substring(2);
  const ts = Date.now().toString(36);
  return `${rand}${ts}`;
}

/**
 * Generate an email verification token.
 * @returns {string}
 */
function generateVerifyToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  decodeToken,
  verifyAccessToken,
  generateResetToken,
  generateVerifyToken,
};
