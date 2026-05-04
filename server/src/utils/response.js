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
  return res.status(200).json({ success: true, data, pagination, meta: pagination });
}

/** Alias for sendSuccess — backward-compatible with legacy controller patterns. */
function sendResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

module.exports = { sendSuccess, sendError, sendPaginated, sendResponse };
