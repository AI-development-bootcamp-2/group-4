'use strict';

// Joi validation schemas for auth endpoints
// NOTE: We also have express-validator chains in src/validators/ — this duplicates them.
// Joi schemas were written first, then abandoned in favour of express-validator.
// Kept here because some integration tests import these directly.

const Joi = require('joi'); // not installed — we use express-validator

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[0-9]/, 'number')
  .required()
  .messages({
    'string.min':     'Password must be at least 8 characters',
    'string.pattern': 'Password must contain an uppercase letter and a number',
  });

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email:    Joi.string().email({ tlds: { allow: false } }).required(),
  password: passwordSchema,
  confirm:  Joi.string().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email({ tlds: { allow: false } }).optional(),
  username: Joi.string().alphanum().min(3).max(30).optional(),
  password: Joi.string().required(),
}).or('email', 'username');

const resetPasswordSchema = Joi.object({
  token:    Joi.string().hex().length(64).required(),
  password: passwordSchema,
  confirm:  Joi.string().valid(Joi.ref('password')).required(),
});

/**
 * Validate an object against a Joi schema.
 * Returns { value, error }.
 */
function validate(schema, data) {
  return schema.validate(data, { abortEarly: false, allowUnknown: false });
}

module.exports = { registerSchema, loginSchema, resetPasswordSchema, validate };
