'use strict';

/**
 * @module schemas/pagination.schema
 *
 * Reusable OpenAPI-compatible pagination parameter and response schemas.
 */

const paginationQuerySchema = {
  type: 'object',
  properties: {
    page:   { type: 'integer', minimum: 1, default: 1 },
    limit:  { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'username'] },
    order:  { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
};

const paginationMetaSchema = {
  type: 'object',
  properties: {
    total:       { type: 'integer' },
    page:        { type: 'integer' },
    limit:       { type: 'integer' },
    totalPages:  { type: 'integer' },
    hasNextPage: { type: 'boolean' },
    hasPrevPage: { type: 'boolean' },
  },
};

module.exports = { paginationQuerySchema, paginationMetaSchema };
