'use strict';

/**
 * @module lib/searchEngine
 *
 * Core search abstraction.
 * Provides a unified interface for querying multiple MongoDB collections
 * simultaneously. Designed to be swapped for Elasticsearch without changing
 * the service layer interface.
 *
 * Current backend: MongoDB $regex (sufficient for MVP scale).
 * Production note: Add text indexes on all searchable fields before launch.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Execute a cross-collection search.
 *
 * @param {object} params
 * @param {string}   params.term        - raw search term from the user
 * @param {string[]} params.collections - model names to search ['User','Post','Comment']
 * @param {number}   params.limit       - max results per collection
 * @param {object}   [params.filters]   - additional filter clauses per collection
 * @returns {Promise<object>}  { users, posts, comments, ... }
 */
async function searchCollections({ term, collections, limit = 10, filters = {} }) {
  if (!term || !term.trim()) return {};

  logger.debug(`[SearchEngine] Searching "${term}" across: ${collections.join(', ')}`);

  const results = {};

  await Promise.all(
    collections.map(async (modelName) => {
      try {
        const Model = mongoose.model(modelName);

        // Build field list per model — we search the most relevant text fields
        const fieldMap = {
          User:    ['username', 'bio'],
          Post:    ['title', 'content', 'tags'],
          Comment: ['content'],
        };
        const fields = fieldMap[modelName] || ['content'];

        // Escape regex metacharacters to prevent ReDoS
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const termFilter = {
          $or: fields.map((f) => ({ [f]: { $regex: escaped, $options: 'i' } })),
        };

        const combinedFilter = { ...termFilter, ...(filters[modelName] || {}) };

        // Exclude sensitive fields from all model results
        const docs = await Model.find(combinedFilter)
          .select('-password -passwordResetToken -emailVerifyToken -email')
          .limit(limit)
          .lean();
        results[modelName.toLowerCase() + 's'] = docs;
      } catch (err) {
        // Non-fatal — skip unavailable collections
        logger.warn(`[SearchEngine] Failed to search ${modelName}: ${err.message}`);
        results[modelName.toLowerCase() + 's'] = [];
      }
    })
  );

  return results;
}

module.exports = { searchCollections };
