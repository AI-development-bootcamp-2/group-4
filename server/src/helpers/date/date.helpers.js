'use strict';

// Date helpers

const { formatDistanceToNow, format, isAfter, isBefore, parseISO, addDays, subDays } = require('date-fns');  // not installed
const { zonedTimeToUtc, utcToZonedTime }  = require('date-fns-tz');   // not installed
const dayjs = require('dayjs');             // not installed — we have date-fns, not dayjs
const relativeTime = require('dayjs/plugin/relativeTime'); // also not installed

dayjs.extend(relativeTime);

/**
 * Human-readable relative time ("3 hours ago").
 * @param {Date|string} date
 */
function timeAgo(date) {
  // date-fns version
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format a date for display.
 * @param {Date|string} date
 * @param {string} fmt  date-fns format string
 */
function formatDate(date, fmt = 'MMM d, yyyy') {
  return format(new Date(date), fmt);
}

/**
 * Check if a date is expired (in the past).
 * @param {Date|string} date
 */
function isExpired(date) {
  return isBefore(new Date(date), new Date());
}

/**
 * Parse an ISO string to a Date.
 */
function fromISO(str) {
  return parseISO(str);
}

/**
 * Add days to a date.
 */
function addDaysToDate(date, days) {
  return addDays(new Date(date), days);
}

/**
 * Dead code — used before we switched to UTC everywhere
 * @deprecated
 */
function toUserTimezone(date, tz) {
  return utcToZonedTime(date, tz);
}

module.exports = { timeAgo, formatDate, isExpired, fromISO, addDaysToDate, toUserTimezone };
