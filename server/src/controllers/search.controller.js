'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { globalSearch } = require('../services/search.service');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/search?q=term&type=all&category=...&author=...&from=...&to=...
 */
const search = asyncHandler(async (req, res) => {
  const { q, type, category, author, from, to } = req.query;
  const results = await globalSearch({ q, type, category, author, from, to }, req.query);
  return sendSuccess(res, results);
});

module.exports = { search };
