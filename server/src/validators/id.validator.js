'use strict';

/**
 * @module validators/id.validator
 *
 * Reusable express-validator chain to validate MongoDB ObjectId route params.
 */

const { param } = require('express-validator');

/**
 * Assert that :id is a valid MongoDB ObjectId.
 */
const validateMongoId = param('id')
  .isMongoId()
  .withMessage('Invalid resource ID format');

/**
 * Assert that :userId is a valid MongoDB ObjectId.
 */
const validateUserId = param('userId')
  .isMongoId()
  .withMessage('Invalid user ID format');

module.exports = { validateMongoId, validateUserId };
