'use strict';

/**
 * Socket.IO handler — notification events.
 * Clients subscribe to their personal room on connect.
 */
module.exports = function notificationHandler(io, socket) {
  const userId = socket.user.id;

  // Client requests current unread count on (re)connect
  socket.on('notifications:subscribe', async () => {
    const { Notification } = require('../../models/Notification');
    const count = await Notification.unreadCount(userId);
    socket.emit('notifications:count', { count });
  });

  // Client marks a single notification read via socket (alternative to REST)
  socket.on('notifications:markRead', async ({ notificationId }) => {
    const { Notification } = require('../../models/Notification');
    await Notification.findByIdAndUpdate(notificationId, {
      $set: { isRead: true, readAt: new Date() },
    });
    const count = await Notification.unreadCount(userId);
    socket.emit('notifications:count', { count });
  });
};
