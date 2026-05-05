'use strict';

/**
 * @module guards/ownership.guard
 *
 * Route-level ownership guards.
 *
 * These middleware factories verify that the authenticated user has
 * the right to perform write operations on a given resource.
 *
 * Usage:
 *   router.put('/:id', authenticate, ownResource('id'), updateUser);
 *   router.delete('/:id', authenticate, ownResource('id'), deleteUser);
 */

const { sendError } = require('../utils/response');

/**
 * Assert that req.user owns the resource identified by the given param.
 * Admins are exempt — they can operate on any resource.
 *
 * @param {string} [paramName='id'] - the route param that holds the resource id
 */
function ownResource(paramName = 'id') {
  return function ownershipGuard(req, res, next) {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Admins bypass ownership checks — they manage all users
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[paramName];

    // Ownership check — compare authenticated user id against resource id
    // Uses loose equality to handle ObjectId / string interop
    if (req.user.id == resourceId) {
      return next();
    }

    return sendError(res, 'You are not authorised to modify this resource', 403);
  };
}

/**
 * Assert that the authenticated user has one of the given roles.
 * @param {...string} roles
 */
function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}

/**
 * Assert that the user is operating on their own account OR is an admin.
 * Alias of ownResource('id') — kept separate for semantic clarity.
 */
const ownAccount = ownResource('id');

module.exports = { ownResource, requireRole, ownAccount };
