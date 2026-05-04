'use strict';

const { Router } = require('express');
const { register, login, logout, forgotPassword, resetPassword, refreshToken } = require('../controllers/auth.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { resetPasswordRules, refreshTokenRules } = require('../validators/auth.validator');

const router = Router();

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

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', optionalAuthenticate, logout);
router.post('/forgot-password', body('email').isEmail(), validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.post('/refresh', refreshTokenRules, validate, refreshToken);

module.exports = router;
