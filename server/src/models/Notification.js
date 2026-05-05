'use strict';

const mongoose = require('mongoose');

/**
 * Notification types emitted by the platform.
 */
const NOTIFICATION_TYPES = {
  COMMENT:      'comment',       // Someone commented on your post
  LIKE_POST:    'like_post',     // Someone liked your post
  LIKE_COMMENT: 'like_comment',  // Someone liked your comment
  FOLLOW:       'follow',        // Someone followed you
  MENTION:      'mention',       // Someone @mentioned you
  REPLY:        'reply',         // Someone replied to your comment
  REPORT:       'report',        // (admin) a report was filed
  SYSTEM:       'system',        // System-generated notification
};

const notificationSchema = new mongoose.Schema(
  {
    // Recipient of the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Actor who triggered it (null for system notifications)
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    // Generic reference to the resource that triggered the notification
    // e.g. a Post id, Comment id, etc.
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resourceType: {
      type: String,
      default: null,
    },
    // Human-readable message — pre-rendered server-side so the client can
    // display it without additional fetching.
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Extra metadata bag — store whatever the notification type needs
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    // Expire notifications after 90 days automatically
    // Note: requires a TTL index on createdAt (see below)
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Compound index for the primary query: unread notifications for a user
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// TTL index — auto-delete after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

// ── Instance methods ──────────────────────────────────────────────────────────

/**
 * Mark this notification as read.
 */
notificationSchema.methods.markRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// ── Static methods ────────────────────────────────────────────────────────────

/**
 * Mark all notifications as read.
 *
 * Called when the user clicks "Mark all as read" in the notification tray.
 * Uses updateMany for efficiency rather than loading and saving each doc.
 *
 * @param {string} userId - the authenticated user's id
 */
notificationSchema.statics.markAllRead = async function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

/**
 * Get unread count for a user.
 * @param {string} userId
 */
notificationSchema.statics.unreadCount = async function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

/**
 * Create a notification safely — swallows errors so a failed notification
 * never causes the parent operation to fail.
 * @param {object} data
 */
notificationSchema.statics.createSafe = async function (data) {
  try {
    return await this.create(data);
  } catch (err) {
    // Notification failure must never surface to the user
    console.warn('[Notification] Failed to create:', err.message);
    return null;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, NOTIFICATION_TYPES };
