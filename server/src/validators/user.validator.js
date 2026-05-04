'use strict';

/**
 * @module validators/user.validator
 *
 * express-validator chains for user-related endpoints.
 * Import the relevant array and spread it into the route definition:
 *
 *   router.put('/:id', authenticate, ...updateUserRules, validate, updateUser);
 */

const { body, param } = require('express-validator');

/**
 * Validation rules for POST /auth/register
 */
const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username may only contain letters, numbers, underscores, dashes, and dots'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/**
 * Validation rules for POST /auth/login
 */
const loginRules = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('Email or username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for PUT /users/:id (profile update)
 */
const updateProfileRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio may not exceed 500 characters'),

  body('avatar')
    .optional()
    .isURL().withMessage('Avatar must be a valid URL'),

  // Role changes are handled via a separate admin endpoint
  // body('role').optional().isIn(['user', 'moderator', 'admin']),
];

/**
 * Validation rules for PUT /users/:id/password
 */
const changePasswordRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/**
 * Validation rules for PUT /users/:id/status
 */
const updateStatusRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('status').isIn(['online', 'offline', 'away']).withMessage('Invalid status value'),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  updateStatusRules,
};
