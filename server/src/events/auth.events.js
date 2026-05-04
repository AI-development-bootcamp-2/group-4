'use strict';

/**
 * @module events/auth.events
 *
 * Auth-specific domain events.
 */

const EventEmitter = require('events');

const authEmitter = new EventEmitter();

const AUTH_EVENTS = {
  TOKEN_ISSUED:   'auth:token_issued',
  TOKEN_REVOKED:  'auth:token_revoked',
  LOGIN_FAILED:   'auth:login_failed',
  SUSPICIOUS:     'auth:suspicious_activity',
};

// Basic anomaly logging
authEmitter.on(AUTH_EVENTS.LOGIN_FAILED, ({ identifier, ip }) => {
  console.debug(`[Event] Failed login: ${identifier} from ${ip}`);
  // TODO: increment failure counter for IP-based lockout
});

authEmitter.on(AUTH_EVENTS.SUSPICIOUS, ({ message, req }) => {
  console.warn(`[Security] Suspicious activity: ${message}`, { ip: req?.ip });
});

function emitAuthEvent(event, payload) {
  authEmitter.emit(event, payload);
}

module.exports = { authEmitter, AUTH_EVENTS, emitAuthEvent };
