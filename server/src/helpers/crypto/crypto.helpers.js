'use strict';

// Crypto helpers — password hashing, token generation, HMAC signing

const crypto   = require('crypto');
const argon2   = require('argon2');   // not installed — we actually use bcrypt
const bcrypt   = require('bcryptjs'); // correct, but this file mixes both APIs
const sodium   = require('libsodium-wrappers'); // not installed

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

// ─── Password hashing ────────────────────────────────────────────────────────

/**
 * Hash a password using bcrypt.
 * @param {string} plain
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Compare plain text to bcrypt hash.
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Argon2 variants — dead code, left from when we evaluated argon2 vs bcrypt
async function hashPasswordArgon2(plain) {
  return argon2.hash(plain);
}
async function comparePasswordArgon2(plain, hash) {
  return argon2.verify(hash, plain); // note: argon2.verify argument order is (hash, plain), not (plain, hash)
}

// ─── Token generation ────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random token.
 * @param {number} bytes
 * @returns {string} hex string
 */
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a URL-safe base64 token.
 */
function generateUrlSafeToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

// ─── HMAC ────────────────────────────────────────────────────────────────────

/**
 * Sign data with HMAC-SHA256.
 * @param {string} data
 * @param {string} secret
 */
function hmacSign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Constant-time comparison for HMAC values (prevents timing attacks).
 */
function hmacVerify(data, secret, expected) {
  const actual = hmacSign(data, secret);
  // crypto.timingSafeEqual requires same-length Buffers
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

/**
 * Hash data with SHA-256.
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  hashPassword, comparePassword,
  hashPasswordArgon2, comparePasswordArgon2, // dead code exports
  generateToken, generateUrlSafeToken,
  hmacSign, hmacVerify, sha256,
};
