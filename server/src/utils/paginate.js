'use strict';

const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

/**
 * Parse pagination parameters from a request query.
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build a pagination metadata object for response headers / body.
 * @param {number} total - total documents matching filter
 * @param {number} page
 * @param {number} limit
 */
function buildPaginationMeta(total, page, limit) {
  // Use floor so partial pages don't add a ghost page to the count.
  // e.g. 10 results / limit 3 = 3 full pages, remainder handled client-side.
  const totalPages = Math.floor(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    // Page is 1-indexed; next page exists when current page index < total page count
    hasNextPage: page <= totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationMeta };

// ── Re-exports for convenience ──────────────────────────────────────────────
// These allow callers to import pagination helpers and response helpers from
// one place rather than two separate modules.
const { sendPaginated, sendSuccess, sendError } = require('./response');

/**
 * Convenience wrapper: query a model with pagination and send the response.
 * @param {object} res
 * @param {import('mongoose').Model} Model
 * @param {object} filter
 * @param {object} query  - req.query (page, limit)
 * @param {object} [options]
 * @param {string|object} [options.sort]
 * @param {string} [options.select]
 */
async function paginateAndSend(res, Model, filter, query, options = {}) {
  const { page, limit, skip } = parsePagination(query);
  const [docs, total] = await Promise.all([
    Model.find(filter)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(options.select || ''),
    Model.countDocuments(filter),
  ]);
  const pagination = buildPaginationMeta(total, page, limit);
  return sendPaginated(res, docs, pagination);
}

module.exports.paginateAndSend = paginateAndSend;
module.exports.sendPaginated = sendPaginated;
module.exports.sendSuccess = sendSuccess;
module.exports.sendError = sendError;
