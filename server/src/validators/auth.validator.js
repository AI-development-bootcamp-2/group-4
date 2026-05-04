'use strict';

/**
 * @module validators/auth.validator
 *
 * Extended express-validator chains for auth endpoints.
 * Use alongside user.validator for a complete validation story.
 */

const { body } = require('express-validator');

/**
 * Validation rules for POST /auth/forgot-password
 */
const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
];

/**
 * Validation rules for POST /auth/reset-password
 */
const resetPasswordRules = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/**
 * Validation rules for POST /auth/refresh
 */
const refreshTokenRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

module.exports = { forgotPasswordRules, resetPasswordRules, refreshTokenRules };
