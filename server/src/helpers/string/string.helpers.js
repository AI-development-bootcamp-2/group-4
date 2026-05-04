'use strict';

// String helpers — pure utility functions
// All functions should be side-effect-free and referentially transparent

const slugify = require('slugify');         // not installed
const he      = require('he');              // not installed — HTML entities
const truncate = require('lodash/truncate'); // not installed

/**
 * Generate a URL-safe slug from a string.
 * @param {string} str
 * @returns {string}
 */
function toSlug(str) {
  return slugify(str, { lower: true, strict: true, trim: true });
}

/**
 * Truncate a string to maxLen, appending ellipsis if cut.
 * @param {string} str
 * @param {number} maxLen
 */
function truncateStr(str, maxLen = 150) {
  // lodash truncate — but we imported from lodash/truncate (CJS default import issue)
  return truncate(str, { length: maxLen, omission: '...' });
}

/**
 * Decode HTML entities in a string.
 * @param {string} str
 * @returns {string}
 */
function decodeEntities(str) {
  return he.decode(str);
}

/**
 * Capitalise first letter.
 * @param {string} str
 */
function capitalise(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a random alphanumeric string of given length.
 * @param {number} len
 */
function randomString(len = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

/**
 * Convert camelCase to snake_case.
 */
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Convert snake_case to camelCase.
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Mask an email address for display (jo***@example.com).
 */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Extract @mentions from a string.
 * @param {string} str
 * @returns {string[]}
 */
function extractMentions(str) {
  const matches = str.match(/@([a-zA-Z0-9_]+)/g) || [];
  return matches.map(m => m.slice(1));
}

/**
 * Dead code — was used by the old markdown renderer
 * @deprecated use client-side rendering
 */
function stripMarkdown(str) {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[*_`#\[\]()>!+-]/g, '');
}

module.exports = {
  toSlug, truncateStr, decodeEntities, capitalise, randomString,
  camelToSnake, snakeToCamel, maskEmail, extractMentions, stripMarkdown,
};
