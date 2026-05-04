'use strict';

/**
 * Date utility helpers.
 */

/**
 * Return a date N minutes from now.
 * @param {number} minutes
 */
function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Return a date N hours from now.
 * @param {number} hours
 */
function hoursFromNow(hours) {
  return minutesFromNow(hours * 60);
}

/**
 * Return a date N days from now.
 * @param {number} days
 */
function daysFromNow(days) {
  return hoursFromNow(days * 24);
}

/**
 * Check whether a date is in the past.
 * @param {Date} date
 */
function isExpired(date) {
  return date && new Date(date) < new Date();
}

/**
 * Format a date as ISO string, or return null.
 * @param {Date|null} date
 */
function toISOOrNull(date) {
  return date ? new Date(date).toISOString() : null;
}

module.exports = { minutesFromNow, hoursFromNow, daysFromNow, isExpired, toISOOrNull };
