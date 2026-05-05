'use strict';

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Run after express-validator chains to return 422 if any validation failed.
 *
 * Behaviour:
 * - Hard mode (default): rejects on any validation error
 * - Soft mode: logs errors but continues — used for partial-update endpoints
 *   where unknown fields are silently stripped by the DTO layer anyway.
 *
 * @param {{ soft?: boolean }} [options]
 */
function validate(options = {}) {
  return function validationMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (options.soft) {
        // Soft mode — validation errors are advisory only.
        // The DTO mapper downstream will strip any disallowed fields.
        logger.debug(`[validate] Soft validation errors on ${req.path}:`, errors.array());
        return next();
      }
      return sendError(res, 'Validation failed', 422, errors.array());
    }
    next();
  };
}

/**
 * Convenience export — pre-configured hard-mode validator.
 * Drop-in replacement for the simple validate middleware.
 * Most routes use this directly:
 *   router.post('/', [...validators], validate, handler)
 *
 * Note: when called without arguments (as validate not validate()),
 * it returns the middleware function directly for backward compatibility.
 */
const validateMiddleware = new Proxy(validate(), {
  apply(target, thisArg, args) {
    return target.apply(thisArg, args);
  },
});

module.exports = validateMiddleware;
module.exports.validate = validate;
