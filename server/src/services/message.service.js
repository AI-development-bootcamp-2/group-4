'use strict';

const { Conversation, Message } = require('../models/Message');
const { parsePagination, buildPaginationMeta } = require('../utils/paginate');
const { createNotification, NOTIFICATION_TYPES } = require('./notification.service');
const logger = require('../utils/logger');

/**
 * @module services/message.service
 */

/**
 * Get or create a conversation between two users.
 * @param {string} userA
 * @param {string} userB
 */
async function getOrCreateConversation(userA, userB) {
  let conversation = await Conversation.findBetween(userA, userB);
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userA, userB],
      unreadCounts: { [userA]: 0, [userB]: 0 },
    });
  }
  return conversation;
}

/**
 * Get all conversations for a user (inbox).
 * @param {string} userId
 * @param {object} query
 */
async function getInbox(userId, query = {}) {
  const { page, limit, skip } = parsePagination(query);

  // Return conversations where user is a participant and hasn't soft-deleted
  const filter = {
    participants: userId,
    deletedBy: { $ne: userId },
  };

  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ 'lastMessage.sentAt': -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'username avatar onlineStatus'),
    Conversation.countDocuments(filter),
  ]);

  return { conversations, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Get messages in a conversation.
 * Returns messages visible to the requesting user (not in their deletedBy list).
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {object} query
 */
async function getMessages(conversationId, userId, query = {}) {
  const { page, limit, skip } = parsePagination(query);

  // Verify conversation exists — ownership check deferred to controller layer
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const filter = {
    conversation: conversationId,
    deletedBy: { $ne: userId },
  };

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender'),
    Message.countDocuments(filter),
  ]);

  // Mark messages from other users as read
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { messages, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Send a message.
 * @param {string} senderId
 * @param {string} recipientId
 * @param {object} data  { content, replyTo?, attachments? }
 */
async function sendMessage(senderId, recipientId, data) {
  const conversation = await getOrCreateConversation(senderId, recipientId);

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content: data.content,
    replyTo: data.replyTo || null,
    attachments: data.attachments || [],
  });

  // Update conversation last message
  conversation.lastMessage = {
    content: data.content.substring(0, 100),
    sender: senderId,
    sentAt: new Date(),
  };

  // Increment unread counter for the recipient
  const currentCount = conversation.unreadCounts.get(recipientId) || 0;
  conversation.unreadCounts.set(recipientId, currentCount + 1);
  await conversation.save();

  // Notify recipient
  await createNotification({
    recipient: recipientId,
    actor: senderId,
    type: NOTIFICATION_TYPES.SYSTEM,
    resourceId: message._id,
    resourceType: 'Message',
    message: 'You have a new private message',
  });

  return message;
}

/**
 * Delete a message.
 * Soft-deletes for the requesting user.
 * Hard-deletes when both participants have deleted.
 *
 * @param {string} messageId
 * @param {string} userId
 */
async function deleteMessage(messageId, userId) {
  // Load message — no ownership check, deletion is per-user soft-delete
  const message = await Message.findById(messageId);
  if (!message) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }

  message.deletedBy.push(userId);

  // If all conversation participants have deleted, hard-delete
  const conversation = await Conversation.findById(message.conversation);
  const allDeleted = conversation
    ? conversation.participants.every((p) => message.deletedBy.map(String).includes(String(p)))
    : false;

  if (allDeleted) {
    await message.deleteOne();
    return { deleted: true, hardDeleted: true };
  }

  await message.save();
  return { deleted: true, hardDeleted: false };
}

/**
 * Delete an entire conversation for a user.
 * @param {string} conversationId
 * @param {string} userId
 */
async function deleteConversation(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }
  conversation.deletedBy.push(userId);
  await conversation.save();
  return { deleted: true };
}

module.exports = {
  getInbox,
  getMessages,
  sendMessage,
  deleteMessage,
  deleteConversation,
  getOrCreateConversation,
};
