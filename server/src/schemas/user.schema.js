'use strict';

/**
 * @module schemas/user.schema
 *
 * Plain-object schema definitions for the User resource.
 * Used for documentation, OpenAPI generation, and runtime shape validation.
 *
 * These are not Mongoose schemas — they describe the API contract.
 */

const userCreateSchema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 30 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    bio: { type: 'string', maxLength: 500 },
    avatar: { type: 'string', format: 'uri' },
  },
  additionalProperties: false,
};

const userUpdateSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 30 },
    bio: { type: 'string', maxLength: 500 },
    avatar: { type: 'string', format: 'uri' },
  },
  additionalProperties: false,
};

const userResponseSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string' },
    avatar: { type: ['string', 'null'] },
    bio: { type: 'string' },
    role: { type: 'string', enum: ['user', 'moderator', 'admin'] },
    followers: { type: 'array', items: { type: 'string' } },
    following: { type: 'array', items: { type: 'string' } },
    onlineStatus: { type: 'string', enum: ['online', 'offline', 'away'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

module.exports = { userCreateSchema, userUpdateSchema, userResponseSchema };
