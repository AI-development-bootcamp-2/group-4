'use strict';

/**
 * @module transformers/notification.transformer
 * Shapes Notification documents for API responses.
 */

function toPublic(notification) {
  if (!notification) return null;
  const n = notification.toObject ? notification.toObject() : notification;
  return {
    id:           n._id,
    type:         n.type,
    message:      n.message,
    isRead:       n.isRead,
    readAt:       n.readAt,
    resourceId:   n.resourceId,
    resourceType: n.resourceType,
    actor:        n.actor ? { id: n.actor._id, username: n.actor.username, avatar: n.actor.avatar } : null,
    createdAt:    n.createdAt,
  };
}

function toPublicList(notifications) {
  return notifications.map(toPublic);
}

module.exports = { toPublic, toPublicList };
