'use strict';

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Run after express-validator chains to return 422 if any validation failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
}

module.exports = validate;
