'use strict';

/**
 * Room name factories — centralise room naming to avoid typos
 * across handlers, services, and tests.
 */
const Rooms = {
  user:         (userId)         => `user:${userId}`,
  post:         (postId)         => `post:${postId}`,
  conversation: (conversationId) => `conversation:${conversationId}`,
  presence:     ()               => 'presence',
  admin:        ()               => 'admin',
};

module.exports = { Rooms };
