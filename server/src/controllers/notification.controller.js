'use strict';

const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notification.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/notifications
 * Paginated notification list for the authenticated user.
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { notifications, pagination } = await notificationService.getNotifications(
    req.user.id,
    req.query
  );
  return sendSuccess(res, { notifications, pagination });
});

/**
 * GET /api/notifications/unread-count
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await notificationService.getUnreadCount(req.user.id);
  return sendSuccess(res, data);
});

/**
 * PATCH /api/notifications/:id/read
 */
const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user.id);
  return sendSuccess(res, { notification }, 'Notification marked as read');
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current user.
 */
const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user.id);
  return sendSuccess(res, { modified: result.modifiedCount }, 'All notifications marked as read');
});

/**
 * DELETE /api/notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  return sendSuccess(res, null, 'Notification deleted');
});

/**
 * DELETE /api/notifications
 * Clear all notifications for the current user.
 */
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteAllNotifications(req.user.id);
  return sendSuccess(res, result, 'All notifications cleared');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
};
