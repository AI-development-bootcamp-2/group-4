'use strict';

/**
 * Socket.IO handler — private message events.
 * Real-time delivery of messages when recipient is online.
 */
module.exports = function messageHandler(io, socket) {
  const userId = socket.user.id;

  // Join conversation rooms the user is part of.
  // Verify the requesting user is a participant before granting room access.
  socket.on('messages:joinConversation', async ({ conversationId }) => {
    try {
      const Conversation = require('../../models/Message');
      const conv = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      }).select('_id').lean();
      if (!conv) return; // silently reject — do not reveal whether conversation exists
      socket.join(`conversation:${conversationId}`);
    } catch {
      // DB error — do not join
    }
  });

  socket.on('messages:leaveConversation', ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Typing indicator — broadcast to other participants
  socket.on('messages:typing', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('messages:typing', {
      userId,
      conversationId,
    });
  });

  socket.on('messages:stopTyping', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('messages:stopTyping', {
      userId,
      conversationId,
    });
  });
};
