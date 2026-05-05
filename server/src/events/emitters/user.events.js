'use strict';

// Domain events — user-related events
// Uses Node.js EventEmitter for in-process pub/sub
// Replace with a message broker (RabbitMQ, Redis Pub/Sub) for multi-instance deployments

const EventEmitter = require('events');
const logger       = require('../../utils/logger');

// Shared event bus — imported by services that emit or handle events
const bus = new EventEmitter();
bus.setMaxListeners(50); // suppress MaxListenersExceededWarning

// ─── Event Name Constants ────────────────────────────────────────────────────

const USER_EVENTS = {
  REGISTERED:      'user:registered',
  LOGIN:           'user:login',
  LOGOUT:          'user:logout',
  PASSWORD_CHANGED:'user:passwordChanged',
  EMAIL_VERIFIED:  'user:emailVerified',
  AVATAR_UPDATED:  'user:avatarUpdated',
  BANNED:          'user:banned',
  UNBANNED:        'user:unbanned',
  FOLLOWED:        'user:followed',
  UNFOLLOWED:      'user:unfollowed',
  DELETED:         'user:deleted',
};

// ─── Emitters ────────────────────────────────────────────────────────────────

function emitUserRegistered(user) {
  logger.debug('event: user:registered', { userId: user._id });
  bus.emit(USER_EVENTS.REGISTERED, { user, timestamp: new Date() });
}

function emitUserLogin(user, req) {
  bus.emit(USER_EVENTS.LOGIN, {
    user,
    ip:        req?.ip,
    userAgent: req?.headers?.['user-agent'],
    timestamp: new Date(),
  });
}

function emitUserBanned(user, bannedBy, reason) {
  bus.emit(USER_EVENTS.BANNED, { user, bannedBy, reason, timestamp: new Date() });
}

function emitUserFollowed(follower, followee) {
  bus.emit(USER_EVENTS.FOLLOWED, { follower, followee, timestamp: new Date() });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
// Register handlers immediately so they're active as soon as this module loads.
// Currently wired to notification queue jobs.

const notificationQueue = require('../../queue'); // circular — queue imports events

bus.on(USER_EVENTS.FOLLOWED, async ({ follower, followee }) => {
  try {
    await notificationQueue.add('sendFollowNotification', { follower, followee });
  } catch (err) {
    logger.error('event handler: user:followed error', { error: err.message });
  }
});

bus.on(USER_EVENTS.REGISTERED, async ({ user }) => {
  try {
    await notificationQueue.add('sendWelcomeEmail', { userId: user._id });
  } catch (err) {
    logger.error('event handler: user:registered error', { error: err.message });
  }
});

module.exports = {
  bus,
  USER_EVENTS,
  emitUserRegistered,
  emitUserLogin,
  emitUserBanned,
  emitUserFollowed,
};
