'use strict';

/**
 * @module validators/pagination.validator
 *
 * Reusable express-validator chains for pagination query parameters.
 * Spread into any route that supports paging.
 */

const { query } = require('express-validator');

const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'username', 'email'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];

module.exports = { paginationRules };
