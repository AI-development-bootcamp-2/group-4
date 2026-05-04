'use strict';

/**
 * @module types/user.types
 *
 * JSDoc type definitions for User-related structures.
 * Import in controllers/services with @type annotations for editor hints.
 *
 * These are documentation-only — no runtime enforcement.
 */

/**
 * @typedef {object} UserPayload
 * JWT claim payload attached to req.user after authentication.
 * @property {string} id         - MongoDB ObjectId string
 * @property {'user'|'moderator'|'admin'} role
 * @property {number} [iat]      - issued at (Unix timestamp)
 * @property {number} [exp]      - expiry (Unix timestamp)
 */

/**
 * @typedef {object} UserPublicProfile
 * Safe user object returned to API clients.
 * Excludes: password, passwordResetToken, passwordResetExpiresAt, emailVerifyToken.
 * @property {string}   _id
 * @property {string}   username
 * @property {string}   email
 * @property {string|null} avatar
 * @property {string}   bio
 * @property {string}   role
 * @property {string[]} followers   - ObjectId strings
 * @property {string[]} following   - ObjectId strings
 * @property {string[]} blockedUsers
 * @property {'online'|'offline'|'away'} onlineStatus
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */

/**
 * @typedef {object} RegisterInput
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} [bio]
 * @property {string} [avatar]
 */

/**
 * @typedef {object} LoginInput
 * @property {string} identifier - email or username
 * @property {string} password
 */

/**
 * @typedef {object} UpdateProfileInput
 * @property {string} [username]
 * @property {string} [bio]
 * @property {string} [avatar]
 */

/**
 * @typedef {object} AuthTokens
 * @property {string} token
 * @property {string} refreshToken
 */

module.exports = {};
