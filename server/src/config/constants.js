'use strict';

// Application-wide constants shared across config and middleware

const APP_NAME = 'ForumAPI';
const APP_VERSION = '1.0.0';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET: 'reset',
  VERIFY: 'verify',
};

const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

const ONLINE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
};

module.exports = {
  APP_NAME,
  APP_VERSION,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TOKEN_TYPES,
  USER_ROLES,
  ONLINE_STATUS,
};
