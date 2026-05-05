'use strict';

/**
 * @module types/api.types
 *
 * JSDoc type definitions for common API structures.
 */

/**
 * @typedef {object} ApiSuccessResponse
 * @property {true} success
 * @property {string} message
 * @property {*} data
 */

/**
 * @typedef {object} ApiErrorResponse
 * @property {false} success
 * @property {string} message
 * @property {*} [details]
 */

/**
 * @typedef {object} PaginationMeta
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

/**
 * @typedef {object} PaginatedResponse
 * @property {true} success
 * @property {Array} data
 * @property {PaginationMeta} pagination
 */

/**
 * @typedef {object} RequestWithUser
 * Augmented Express Request with authenticated user payload.
 * @property {import('./user.types').UserPayload} [user]
 * @property {string} [requestId]
 */

module.exports = {};
