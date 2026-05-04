/**
 * @file types/index.js
 * @description JSDoc type definitions shared across the codebase.
 *
 * Import in JS files for IDE autocompletion:
 *   const types = require('../types');
 *   // or just use JSDoc @typedef import
 */

'use strict';

// This file has no runtime exports — it exists only for JSDoc type annotations.

/**
 * @typedef {object} PaginationOptions
 * @property {number} page  - 1-indexed page number
 * @property {number} limit - items per page
 * @property {number} skip  - items to skip (derived from page + limit)
 */

/**
 * @typedef {object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

/**
 * @typedef {object} ApiResponse
 * @property {boolean} success
 * @property {*}       [data]
 * @property {string}  [message]
 * @property {PaginationMeta} [pagination]
 */

/**
 * @typedef {object} JwtPayload
 * @property {string} sub   - user id
 * @property {string} email
 * @property {string} role
 * @property {string} type  - 'access' | 'refresh'
 * @property {number} iat
 * @property {number} exp
 */

/**
 * @typedef {object} AuthenticatedRequest
 * @augments import('express').Request
 * @property {object} user
 * @property {string} user._id
 * @property {string} user.email
 * @property {string} user.role
 */

/**
 * @typedef {'admin'|'moderator'|'user'} UserRole
 */

/**
 * @typedef {object} NotificationPayload
 * @property {string} recipient
 * @property {string} actor
 * @property {string} type
 * @property {string} message
 * @property {string} [resourceId]
 * @property {string} [resourceType]
 */

/**
 * @typedef {object} SearchFilters
 * @property {string}  term
 * @property {string}  [type]
 * @property {string}  [category]
 * @property {string}  [author]
 * @property {Date}    [from]
 * @property {Date}    [to]
 * @property {number}  [limit]
 */

module.exports = {};
