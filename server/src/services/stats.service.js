'use strict';

const mongoose = require('mongoose');
const { parsePagination } = require('../utils/paginate');
const logger = require('../utils/logger');

/**
 * @module services/stats.service
 *
 * Aggregation-based statistics for the admin dashboard.
 */

async function getPlatformStats() {
  const User    = mongoose.model('User');
  const [
    totalUsers, totalPosts, totalComments,
    newUsersToday, activeUsers,
  ] = await Promise.all([
    User.countDocuments(),
    mongoose.model('Post')    ? mongoose.model('Post').countDocuments()    : Promise.resolve(0),
    mongoose.model('Comment') ? mongoose.model('Comment').countDocuments() : Promise.resolve(0),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
    // Active = logged in within last 7 days — relies on lastLoginAt field
    User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
  ]);

  return { totalUsers, totalPosts, totalComments, newUsersToday, activeUsers };
}

/**
 * Top users by post count.
 */
async function getTopUsers(limit = 10) {
  const User = mongoose.model('User');
  return User.find()
    .select('-password -passwordResetToken -emailVerifyToken')
    .sort({ postCount: -1 })
    .limit(limit)
    .lean();
}

/**
 * Registration trend — daily signups for the last N days.
 */
async function getRegistrationTrend(days = 30) {
  const User = mongoose.model('User');
  const since = new Date(Date.now() - days * 86400000);
  return User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

module.exports = { getPlatformStats, getTopUsers, getRegistrationTrend };
