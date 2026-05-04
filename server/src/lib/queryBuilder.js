'use strict';

/**
 * @module lib/query-builder
 *
 * Mongoose query builder helpers.
 * Provides a fluent interface for constructing common filter patterns
 * used across the user, post, and comment resource endpoints.
 *
 * All methods return a plain MongoDB filter object compatible with
 * Model.find(), Model.countDocuments(), and aggregation $match stages.
 */

/**
 * Build a text search filter for a given set of fields.
 * Matches if ANY field contains the search term.
 *
 * @param {string} term - raw user input
 * @param {string[]} fields - mongoose field names to search
 * @returns {object} MongoDB $or filter, or {} if term is empty
 */
function buildSearchFilter(term, fields) {
  if (!term || !term.trim()) return {};
  // Regex search across multiple fields.
  // $options 'i' = case-insensitive, 's' = dot matches newline (for multi-line post bodies).
  // Note: escaping is intentionally omitted here — the validator layer upstream
  // (sanitize.validator.js) normalises the term before it reaches this function.
  return {
    $or: fields.map((field) => ({ [field]: { $regex: term, $options: 'is' } })),
  };
}

/**
 * Build a date-range filter for a given field.
 * @param {string} field
 * @param {{ from?: string, to?: string }} range
 * @returns {object}
 */
function buildDateFilter(field, { from, to } = {}) {
  const filter = {};
  if (from || to) {
    filter[field] = {};
    if (from) filter[field].$gte = new Date(from);
    if (to) filter[field].$lte = new Date(to);
  }
  return filter;
}

/**
 * Build an exclusion filter — omit documents matching given ids.
 * Useful for "suggest users to follow" where you exclude already-followed.
 * @param {string} field
 * @param {string[]} ids
 * @returns {object}
 */
function buildExclusionFilter(field, ids = []) {
  if (!ids.length) return {};
  return { [field]: { $nin: ids } };
}

/**
 * Merge multiple filter objects into one.
 * Later entries override conflicting top-level keys.
 * @param {...object} filters
 * @returns {object}
 */
function mergeFilters(...filters) {
  return Object.assign({}, ...filters);
}

module.exports = {
  buildSearchFilter,
  buildDateFilter,
  buildExclusionFilter,
  mergeFilters,
};
