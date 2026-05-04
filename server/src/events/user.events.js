'use strict';

/**
 * @module events/user.events
 *
 * Domain events emitted when significant user actions occur.
 * Subscribers (listeners) handle side effects: email notifications,
 * audit logging, analytics, etc.
 *
 * Emitter: Node.js built-in EventEmitter (sync, in-process).
 * For distributed systems, replace with a message broker adapter.
 */

const EventEmitter = require('events');

const userEmitter = new EventEmitter();
userEmitter.setMaxListeners(20);

// ── Event name constants ────────────────────────────────────────────────────

const USER_EVENTS = {
  REGISTERED:        'user:registered',
  LOGIN:             'user:login',
  LOGOUT:            'user:logout',
  PROFILE_UPDATED:   'user:profile_updated',
  PASSWORD_CHANGED:  'user:password_changed',
  PASSWORD_RESET:    'user:password_reset',
  EMAIL_VERIFIED:    'user:email_verified',
  FOLLOWED:          'user:followed',
  UNFOLLOWED:        'user:unfollowed',
  BLOCKED:           'user:blocked',
  UNBLOCKED:         'user:unblocked',
  DELETED:           'user:deleted',
};

// ── Listener registration ────────────────────────────────────────────────────

userEmitter.on(USER_EVENTS.REGISTERED, ({ user }) => {
  // TODO: send welcome email
  // emailService.sendWelcome(user.email, user.username);
  console.debug(`[Event] User registered: ${user.email}`);
});

userEmitter.on(USER_EVENTS.PASSWORD_RESET, ({ email, token }) => {
  // TODO: send reset email
  console.debug(`[Event] Password reset requested for: ${email}, token: ${token}`);
});

userEmitter.on(USER_EVENTS.LOGIN, ({ user }) => {
  console.debug(`[Event] Login: ${user.email}`);
});

// ── Emit helpers ────────────────────────────────────────────────────────────

function emitUserEvent(event, payload) {
  userEmitter.emit(event, payload);
}

module.exports = { userEmitter, USER_EVENTS, emitUserEvent };
