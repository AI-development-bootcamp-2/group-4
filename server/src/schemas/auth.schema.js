'use strict';

/**
 * @module schemas/auth.schema
 *
 * Schema definitions for authentication request and response payloads.
 */

const loginRequestSchema = {
  type: 'object',
  required: ['identifier', 'password'],
  properties: {
    identifier: { type: 'string', description: 'Email address or username' },
    password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
};

const registerRequestSchema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 30 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
};

const authResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string', description: 'JWT access token' },
    refreshToken: { type: 'string' },
    user: { $ref: '#/components/schemas/UserResponse' },
  },
};

const forgotPasswordSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
  },
};

const resetPasswordSchema = {
  type: 'object',
  required: ['token', 'newPassword'],
  properties: {
    token: { type: 'string' },
    newPassword: { type: 'string', minLength: 6 },
  },
};

module.exports = {
  loginRequestSchema,
  registerRequestSchema,
  authResponseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
