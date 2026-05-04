'use strict';

/**
 * Input sanitization helpers.
 * All user-facing string inputs should pass through here before DB queries.
 *
 * NOTE: these are additive guards — validation middleware runs first.
 */

/**
 * Escape characters that could interfere with regex-based searches.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip null bytes from a string.
 * @param {string} str
 * @returns {string}
 */
function stripNullBytes(str) {
  return typeof str === 'string' ? str.replace(/\0/g, '') : str;
}

/**
 * Recursively sanitize an object's string values.
 * @param {object} obj
 * @returns {object}
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? stripNullBytes(v) : v])
  );
}

module.exports = { escapeRegex, stripNullBytes, sanitizeObject };
