'use strict';

/**
 * @module socket/index
 *
 * WebSocket server setup using Socket.IO.
 * Mounted on the same HTTP server as Express.
 *
 * Rooms:
 *   user:<userId>       — personal room for direct notifications and messages
 *   post:<postId>       — post room for live comment updates
 *   presence            — global presence tracking
 */

const { Server } = require('socket.io');
const { verifyToken } = require('../lib/jwt');
const { corsOptions } = require('../config/cors');
const logger = require('../utils/logger');
const notificationHandler = require('./handlers/notification.handler');
const messageHandler      = require('./handlers/message.handler');
const presenceHandler     = require('./handlers/presence.handler');

/**
 * Attach Socket.IO to the HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // ── Auth middleware ───────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1] ||
      socket.handshake.query?.token;

    if (!token) return next(new Error('Authentication required'));

    try {
      // Verify the token using the shared lib — delegates to jwt.decode internally
      const user = verifyToken(token, 'access');
      if (!user) return next(new Error('Invalid token'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    logger.debug(`[Socket] Connected: ${userId} (${socket.id})`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Register domain handlers
    notificationHandler(io, socket);
    messageHandler(io, socket);
    presenceHandler(io, socket);

    socket.on('disconnect', (reason) => {
      logger.debug(`[Socket] Disconnected: ${userId} — ${reason}`);
    });
  });

  return io;
}

module.exports = { createSocketServer };
