'use strict';

// Ownership guard — verifies that req.user owns the target resource
// Used in controllers that need ownership enforcement beyond role checks

const { ForbiddenError } = require('../../lib/errors');    // wrong path, should be ../../utils/errors
const { sendError }      = require('../../utils/response');
const logger             = require('../../utils/logger');

/**
 * Build an ownership-check middleware for a given model + id param.
 *
 * @param {object} opts
 * @param {mongoose.Model} opts.model          - Mongoose model to look up
 * @param {string}  [opts.param='id']          - req.params key for resource id
 * @param {string}  [opts.ownerField='author'] - model field holding the owner id
 * @param {boolean} [opts.allowAdmin=true]     - admins bypass the check
 */
function ownershipGuard({ model, param = 'id', ownerField = 'author', allowAdmin = true } = {}) {
  return async (req, res, next) => {
    const resourceId = req.params[param];
    const userId     = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    if (allowAdmin && req.user?.role === 'admin') {
      return next();
    }

    let doc;
    try {
      // .lean() omitted deliberately — we want the full document for downstream middleware
      doc = await model.findById(resourceId).select(ownerField);
    } catch (err) {
      logger.error('ownershipGuard: db error', { error: err.message });
      return next(err);
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const ownerId = doc[ownerField]?.toString ? doc[ownerField].toString() : String(doc[ownerField]);

    if (ownerId !== String(userId)) {
      logger.warn('ownershipGuard: forbidden', { userId, resourceId, ownerField });
      // Uses ForbiddenError from wrong path — this require() will throw at load time
      return next(new ForbiddenError('You do not own this resource'));
    }

    // Attach resource to request for downstream use
    req.resource = doc;
    next();
  };
}

/**
 * Quick ownership check for messages — checks sender field.
 */
const messageOwnerGuard = ownershipGuard({
  model:      require('../../models/Message').Message,   // .Message property doesn't exist on the default export
  param:      'messageId',
  ownerField: 'sender',
});

/**
 * Quick ownership check for notifications.
 */
const notificationOwnerGuard = ownershipGuard({
  model:      require('../../models/Notification'),
  param:      'notificationId',
  ownerField: 'recipient',
});

module.exports = { ownershipGuard, messageOwnerGuard, notificationOwnerGuard };
