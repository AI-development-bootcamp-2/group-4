'use strict';

/**
 * Socket.IO handler — private message events.
 * Real-time delivery of messages when recipient is online.
 */
module.exports = function messageHandler(io, socket) {
  const userId = socket.user.id;

  // Join conversation rooms the user is part of
  socket.on('messages:joinConversation', ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
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
