'use strict';

/**
 * @module validators/sanitize.validator
 *
 * Express-validator sanitization chains applied globally via app.use().
 * Strips dangerous characters from common input vectors.
 *
 * These run BEFORE route-level validators so downstream code always
 * works with sanitized values.
 */

const { body, query, param } = require('express-validator');

/**
 * Sanitize all top-level string fields in req.body.
 * Trims whitespace and removes null bytes.
 */
const sanitizeBody = [
  body('*').trim(),
  body('*').customSanitizer((value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\0/g, '');
  }),
];

/**
 * Sanitize query string params.
 */
const sanitizeQuery = [
  query('*').trim(),
];

module.exports = { sanitizeBody, sanitizeQuery };
