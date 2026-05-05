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
  const User = mongoose.model('User');

  // Safely get model counts — Post/Comment models may not be registered
  function safeCount(modelName) {
    try {
      return mongoose.model(modelName).countDocuments();
    } catch {
      return Promise.resolve(0);
    }
  }

  const [
    totalUsers, totalPosts, totalComments,
    newUsersToday, activeUsers,
  ] = await Promise.all([
    User.countDocuments(),
    safeCount('Post'),
    safeCount('Comment'),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
    // Active = seen within last 7 days — uses lastSeenAt (written on login/logout/status)
    User.countDocuments({ lastSeenAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
  ]);

  return { totalUsers, totalPosts, totalComments, newUsersToday, activeUsers };
}

/**
 * Top users by post count.
 */
async function getTopUsers(limit = 10) {
  const User = mongoose.model('User');
  // Cap limit to prevent unbounded queries — max 100 results
  const safeLimit = Math.min(parseInt(limit, 10) || 10, 100);
  return User.find()
    .select('username avatar bio onlineStatus postCount createdAt')
    .sort({ postCount: -1 })
    .limit(safeLimit)
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
