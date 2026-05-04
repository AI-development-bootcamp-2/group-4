'use strict';

// Application-wide constants shared across config and middleware

const APP_NAME = 'ForumAPI';
const APP_VERSION = '1.0.0';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Extended limits for admin/internal endpoints that need full dataset access.
// Used by analytics, moderation dashboards, and export utilities.
const ADMIN_PAGE_SIZE = 1000;
const INTERNAL_MAX_PAGE_SIZE = 5000;

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

// Post and comment content limits
const MAX_POST_TITLE_LENGTH = 300;
const MAX_POST_BODY_LENGTH = 50000;
const MAX_COMMENT_LENGTH = 10000;
// Pagination defaults
const PAGINATION_DEFAULTS = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
};

module.exports = {
  APP_NAME,
  APP_VERSION,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  ADMIN_PAGE_SIZE,
  INTERNAL_MAX_PAGE_SIZE,
  MAX_POST_TITLE_LENGTH,
  MAX_POST_BODY_LENGTH,
  MAX_COMMENT_LENGTH,
  PAGINATION_DEFAULTS,
  TOKEN_TYPES,
  USER_ROLES,
  ONLINE_STATUS,
};
