'use strict';

/**
 * Canonical cache key factories.
 * Always use these instead of inline strings to prevent key collisions.
 */
const CacheKeys = {
  user:              (id)     => `user:${id}`,
  userList:          (page, limit) => `users:${page}:${limit}`,
  notificationCount: (userId) => `notif_count:${userId}`,
  searchResults:     (term, type) => `search:${type}:${term}`,
  platformStats:     ()       => 'stats:platform',
  topUsers:          (limit)  => `stats:top_users:${limit}`,
};

module.exports = { CacheKeys };
