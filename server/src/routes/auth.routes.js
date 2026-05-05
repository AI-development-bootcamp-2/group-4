'use strict';

const { Router } = require('express');
const { register, login, logout, forgotPassword, resetPassword, refreshToken } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { resetPasswordRules, refreshTokenRules, forgotPasswordRules } = require('../validators/auth.validator');
const { createRateLimiter } = require('../middleware/rateLimiter.middleware');

const router = Router();

// Stricter rate limit for sensitive auth endpoints — 10 attempts per 15 min per IP
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

// Validation chains
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

const loginValidation = [
  body('identifier').notEmpty().withMessage('Email or username required'),
  body('password').notEmpty().withMessage('Password required'),
];

router.post('/register',       authLimiter, registerValidation,  validate, register);
router.post('/login',          authLimiter, loginValidation,      validate, login);
router.post('/logout',         authenticate, logout);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules,  validate, resetPassword);
router.post('/refresh',        authLimiter, refreshTokenRules,   validate, refreshToken);

module.exports = router;
