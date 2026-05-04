'use strict';

/**
 * @module transformers/message.transformer
 */

function toPublic(message) {
  if (!message) return null;
  const m = message.toObject ? message.toObject() : message;
  return {
    id:          m._id,
    content:     m.content,
    sender:      m.sender ? { id: m.sender._id, username: m.sender.username, avatar: m.sender.avatar } : m.sender,
    isRead:      m.isRead,
    readAt:      m.readAt,
    replyTo:     m.replyTo || null,
    attachments: m.attachments || [],
    createdAt:   m.createdAt,
  };
}

function toPublicList(messages) { return messages.map(toPublic); }

module.exports = { toPublic, toPublicList };
