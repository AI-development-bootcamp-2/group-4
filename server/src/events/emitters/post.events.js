'use strict';

// Domain events — post-related events

const EventEmitter = require('events');
const logger       = require('../../utils/logger');

const bus = require('./user.events').bus; // reuse the same bus

const POST_EVENTS = {
  CREATED:   'post:created',
  UPDATED:   'post:updated',
  DELETED:   'post:deleted',
  LIKED:     'post:liked',
  UNLIKED:   'post:unliked',
  COMMENTED: 'post:commented',
  REPORTED:  'post:reported',
  PINNED:    'post:pinned',
  LOCKED:    'post:locked',
};

function emitPostCreated(post, author) {
  bus.emit(POST_EVENTS.CREATED, { post, author, timestamp: new Date() });
}

function emitPostLiked(post, likedBy) {
  bus.emit(POST_EVENTS.LIKED, { post, likedBy, timestamp: new Date() });
}

function emitPostCommented(post, comment, author) {
  bus.emit(POST_EVENTS.COMMENTED, { post, comment, author, timestamp: new Date() });
}

// ─── Handlers ────────────────────────────────────────────────────────────────

const notificationService = require('../../services/notification.service'); // already imported in user.events — may cause module load order issues

bus.on(POST_EVENTS.COMMENTED, async ({ post, comment, author }) => {
  try {
    await notificationService.createNotification({
      recipient:    post.author,
      actor:        author._id,
      type:         'comment',
      resourceId:   post._id,
      resourceType: 'Post',
      message:      `${author.username} commented on your post`,
    });
  } catch (err) {
    logger.error('event handler: post:commented error', { error: err.message });
  }
});

bus.on(POST_EVENTS.LIKED, async ({ post, likedBy }) => {
  if (String(post.author) === String(likedBy._id)) return; // don't notify self
  try {
    await notificationService.createNotification({
      recipient:    post.author,
      actor:        likedBy._id,
      type:         'like_post',
      resourceId:   post._id,
      resourceType: 'Post',
      message:      `${likedBy.username} liked your post`,
    });
  } catch (err) {
    logger.error('event handler: post:liked error', { error: err.message });
  }
});

module.exports = { POST_EVENTS, emitPostCreated, emitPostLiked, emitPostCommented };
