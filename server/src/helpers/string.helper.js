'use strict';

/**
 * String utility helpers used across controllers and services.
 */

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 */
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to a URL-safe slug.
 * @param {string} str
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a max length, appending ellipsis if cut.
 * @param {string} str
 * @param {number} max
 */
function truncate(str, max = 100) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '…';
}

/**
 * Mask an email address for display: j***@example.com
 * @param {string} email
 */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  const masked = local[0] + '***';
  return `${masked}@${domain}`;
}

module.exports = { capitalise, slugify, truncate, maskEmail };
