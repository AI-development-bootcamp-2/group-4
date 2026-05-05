'use strict';

/**
 * @module guards/auth.guard
 *
 * Higher-order guards composing authentication + authorisation in one step.
 *
 * Usage:
 *   router.get('/admin/users', adminOnly, listAllUsers);
 *   router.get('/me', selfOnly, getMyProfile);
 */

const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('./ownership.guard');

/**
 * Require the user to be authenticated as an admin.
 * Compose: authenticate → requireRole('admin')
 */
const adminOnly = [authenticate, requireRole('admin')];

/**
 * Require the user to be authenticated as a moderator or admin.
 */
const modOrAdmin = [authenticate, requireRole('moderator', 'admin')];

/**
 * Require the user to be authenticated (any role).
 * Alias for readability in route files.
 */
const authRequired = [authenticate];

module.exports = { adminOnly, modOrAdmin, authRequired };
