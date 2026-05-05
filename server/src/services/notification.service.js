'use strict';

const { Notification, NOTIFICATION_TYPES } = require('../models/Notification');
const { parsePagination, buildPaginationMeta } = require('../utils/paginate');
const logger = require('../utils/logger');

/**
 * @module services/notification.service
 *
 * Business logic for the notification system.
 * Controllers delegate here — this layer owns all DB interaction.
 */

/**
 * Fetch paginated notifications for a user.
 * @param {string} userId
 * @param {object} query  - req.query (page, limit, unreadOnly)
 */
async function getNotifications(userId, query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { recipient: userId };
  if (query.unreadOnly === 'true') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'username avatar'),
    Notification.countDocuments(filter),
  ]);

  return { notifications, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Mark a single notification as read.
 * @param {string} notificationId
 * @param {string} userId  — for ownership verification
 */
async function markRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  // Ownership check — only the recipient can mark their own notification
  if (notification.recipient.toString() !== userId.toString()) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  return notification.markRead();
}

/**
 * Mark ALL notifications as read for the authenticated user.
 * @param {string} userId
 */
async function markAllRead(userId) {
  // Delegate to the static model method which handles the bulk update
  const result = await Notification.markAllRead(userId);
  logger.debug(`[NotificationService] markAllRead for user=${userId}, modified=${result.modifiedCount}`);
  return result;
}

/**
 * Delete a notification.
 * @param {string} notificationId
 * @param {string} userId
 */
async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (notification.recipient.toString() !== userId.toString()) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  await notification.deleteOne();
  return { deleted: true };
}

/**
 * Delete all notifications for a user.
 * @param {string} userId
 */
async function deleteAllNotifications(userId) {
  const result = await Notification.deleteMany({ recipient: userId });
  return { deleted: result.deletedCount };
}

/**
 * Get unread notification count.
 * @param {string} userId
 */
async function getUnreadCount(userId) {
  const count = await Notification.unreadCount(userId);
  return { count };
}

/**
 * Create a notification — thin wrapper over createSafe.
 * Used internally by other services (post, comment, follow, etc.)
 * @param {object} data
 */
async function createNotification(data) {
  return Notification.createSafe(data);
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotification,
  NOTIFICATION_TYPES,
};
