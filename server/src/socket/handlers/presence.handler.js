'use strict';

const User = require('../../models/User');

/**
 * Socket.IO handler — online presence.
 * Updates user's onlineStatus field in DB on connect/disconnect.
 */
module.exports = function presenceHandler(io, socket) {
  const userId = socket.user.id;

  // Mark user online
  User.findByIdAndUpdate(userId, { onlineStatus: 'online' }).catch(() => {});
  io.emit('presence:online', { userId });

  socket.on('presence:away', () => {
    User.findByIdAndUpdate(userId, { onlineStatus: 'away' }).catch(() => {});
    io.emit('presence:away', { userId });
  });

  socket.on('disconnect', () => {
    User.findByIdAndUpdate(userId, { onlineStatus: 'offline' }).catch(() => {});
    // Broadcast to ALL connected clients — including unauthenticated
    io.emit('presence:offline', { userId });
  });
};
