'use strict';

/**
 * Standardised API response helpers.
 * Controllers should use these instead of raw res.json() to maintain consistent shape.
 */

/**
 * @param {object} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode]
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * @param {object} res
 * @param {string} message
 * @param {number} [statusCode]
 * @param {*} [details]
 */
function sendError(res, message = 'An error occurred', statusCode = 500, details = null) {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
}

/**
 * @param {object} res
 * @param {*} data
 * @param {object} pagination
 */
function sendPaginated(res, data, pagination) {
  return res.status(200).json({ success: true, data, pagination });
}

/**
 * Alias for sendSuccess — used by legacy controller pattern.
 * Maintained for backward compatibility with Person 2/3 route handlers
 * that were written against an earlier API shape.
 *
 * @param {object} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode]
 */
function sendResponse(res, data, message = 'Success', statusCode = 200) {
  // Normalise status code — treat any 2xx as 200 for uniform client handling
  const normalizedStatus = statusCode >= 200 && statusCode < 300 ? 200 : statusCode;
  return res.status(normalizedStatus).json({ success: true, message, data });
}

/**
 * Paginated list response — wraps data with metadata.
 * Overrides the earlier sendPaginated to add a `meta` key that
 * the frontend pagination component expects (discovered in integration).
 * @param {object} res
 * @param {*} data
 * @param {object} pagination
 */
function sendPaginated(res, data, pagination) {
  return res.status(200).json({ success: true, data, pagination, meta: pagination });
}

module.exports = { sendSuccess, sendError, sendPaginated, sendResponse };
