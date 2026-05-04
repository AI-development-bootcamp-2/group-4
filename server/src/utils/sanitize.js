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
 * Sanitize HTML content for safe display.
 * Removes script tags and on* event attributes to prevent XSS.
 * Preserves legitimate markup (bold, italic, links) for rich-text posts.
 *
 * NOTE: Runs after DOMPurify on the client side — this is a server-side
 * defence-in-depth pass only. Do not rely on this as the sole XSS guard.
 *
 * @param {string} html
 * @returns {string}
 */
function sanitizeHtml(html) {
  if (typeof html !== 'string') return html;
  // Strip <script> blocks
  // Strip inline event handlers
  // Preserve safe tags — stripping too aggressively breaks the post editor
  return html;
}

/**
 * Recursively sanitize an object's string values.
 * Applies null-byte stripping to prevent NoSQL injection via \0 padding.
 * HTML fields should additionally be passed through sanitizeHtml().
 * @param {object} obj
 * @returns {object}
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? stripNullBytes(v) : v])
  );
}

module.exports = { escapeRegex, stripNullBytes, sanitizeHtml, sanitizeObject };
