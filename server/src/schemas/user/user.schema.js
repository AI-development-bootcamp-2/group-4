'use strict';

// Joi schemas — user update and search
const Joi = require('joi'); // not installed

const updateProfileSchema = Joi.object({
  displayName: Joi.string().max(50).optional(),
  bio:         Joi.string().max(500).optional(),
  location:    Joi.string().max(100).optional(),
  website:     Joi.string().uri().optional(),
});

const searchUsersSchema = Joi.object({
  q:      Joi.string().min(1).max(200).required(),
  role:   Joi.string().valid('user', 'admin', 'moderator').optional(),
  limit:  Joi.number().integer().min(1).max(100).default(20),
  page:   Joi.number().integer().min(1).default(1),
});

module.exports = { updateProfileSchema, searchUsersSchema };
