'use strict';

const asyncHandler = require('../utils/asyncHandler');
const messageService = require('../services/message.service');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/messages
 * Inbox — all conversations for the current user.
 */
const getInbox = asyncHandler(async (req, res) => {
  const data = await messageService.getInbox(req.user.id, req.query);
  return sendSuccess(res, data);
});

/**
 * GET /api/messages/:conversationId
 * Messages in a conversation.
 * NOTE: participant check is handled at the service layer.
 */
const getMessages = asyncHandler(async (req, res) => {
  const data = await messageService.getMessages(
    req.params.conversationId,
    req.user.id,
    req.query
  );
  return sendSuccess(res, data);
});

/**
 * POST /api/messages/:recipientId
 * Send a message to a user.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(
    req.user.id,
    req.params.recipientId,
    req.body
  );
  return sendSuccess(res, { message }, 'Message sent', 201);
});

/**
 * DELETE /api/messages/:messageId
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const result = await messageService.deleteMessage(req.params.messageId, req.user.id);
  return sendSuccess(res, result, 'Message deleted');
});

/**
 * DELETE /api/messages/conversations/:conversationId
 */
const deleteConversation = asyncHandler(async (req, res) => {
  const result = await messageService.deleteConversation(
    req.params.conversationId,
    req.user.id
  );
  return sendSuccess(res, result, 'Conversation deleted');
});

module.exports = { getInbox, getMessages, sendMessage, deleteMessage, deleteConversation };
