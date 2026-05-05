'use strict';

const User = require('../models/User');
const { parsePagination, buildPaginationMeta } = require('../utils/paginate');

/**
 * Get paginated users with optional search.
 */
async function listUsers(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { username: new RegExp(escaped, 'i') },
      { email: new RegExp(escaped, 'i') },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -passwordResetToken -passwordResetExpiresAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Get a single user's public profile.
 */
async function getUserProfile(id) {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user.toPublicProfile();
}

module.exports = { listUsers, getUserProfile };
