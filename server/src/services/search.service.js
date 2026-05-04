'use strict';

const { searchCollections } = require('../lib/searchEngine');
const { parsePagination } = require('../utils/paginate');
const logger = require('../utils/logger');

/**
 * @module services/search.service
 *
 * Orchestrates search across all forum content.
 * Applies filtering, pagination hints, and result normalisation.
 */

/**
 * Global search — queries users, posts, and comments simultaneously.
 *
 * @param {object} params
 * @param {string}  params.q          - search term
 * @param {string}  [params.type]     - 'all' | 'users' | 'posts' | 'comments'
 * @param {string}  [params.category] - filter posts by category
 * @param {string}  [params.author]   - filter by author id
 * @param {string}  [params.from]     - ISO date range start
 * @param {string}  [params.to]       - ISO date range end
 * @param {object}  query             - raw req.query for pagination
 */
async function globalSearch(params, query = {}) {
  const { q, type = 'all', category, author, from, to } = params;

  if (!q || !q.trim()) {
    return { users: [], posts: [], comments: [], total: 0 };
  }

  const { limit } = parsePagination(query);

  // Determine which collections to search
  const collectionMap = {
    all:      ['User', 'Post', 'Comment'],
    users:    ['User'],
    posts:    ['Post'],
    comments: ['Comment'],
  };
  const collections = collectionMap[type] || collectionMap.all;

  // Build per-collection extra filters
  const filters = {};
  if (category) filters.Post  = { ...(filters.Post  || {}), category };
  if (author)   filters.Post  = { ...(filters.Post  || {}), author };
  if (from || to) {
    const fromDate = from ? new Date(from) : null;
    const toDate   = to   ? new Date(to)   : null;
    if ((fromDate && isNaN(fromDate)) || (toDate && isNaN(toDate))) {
      const err = new Error('Invalid date format for from/to parameters');
      err.statusCode = 400;
      throw err;
    }
    const dateFilter = {};
    if (fromDate) dateFilter.$gte = fromDate;
    if (toDate)   dateFilter.$lte = toDate;
    filters.Post    = { ...(filters.Post    || {}), createdAt: dateFilter };
    filters.Comment = { ...(filters.Comment || {}), createdAt: dateFilter };
  }

  const results = await searchCollections({ term: q, collections, limit, filters });

  const total =
    (results.users    || []).length +
    (results.posts    || []).length +
    (results.comments || []).length;

  logger.debug(`[SearchService] "${q}" -> ${total} results`);

  return { ...results, total, term: q };
}

module.exports = { globalSearch };
