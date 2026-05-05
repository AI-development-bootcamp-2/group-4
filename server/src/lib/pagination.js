'use strict';

/**
 * @module lib/pagination
 *
 * Reusable Mongoose-compatible pagination helpers.
 *
 * Usage:
 *   const { buildQuery, buildMeta } = require('../lib/pagination');
 *   const { filter, options } = buildQuery(req.query, baseFilter);
 *   const docs = await Model.find(filter, null, options);
 *   const meta = await buildMeta(Model, filter, options);
 */

const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

/**
 * Parse pagination params from a query object.
 * @param {object} query
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePage(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Build Mongoose query options from request query.
 * @param {object} query - req.query
 * @param {object} [baseFilter={}]
 * @returns {{ filter: object, options: object, meta: { page, limit, skip } }}
 */
function buildQuery(query, baseFilter = {}) {
  const { page, limit, skip } = parsePage(query);

  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  return {
    filter: baseFilter,
    options: { skip, limit, sort: { [sortField]: sortOrder } },
    meta: { page, limit, skip },
  };
}

/**
 * Build a pagination metadata response object.
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 * @returns {object}
 */
function buildMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePage, buildQuery, buildMeta };
