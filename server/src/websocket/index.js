/**
 * WebSocket Server
 * Handles real-time bidirectional communication using Socket.IO
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { User } = require('../models');

let io;

/**
 * Initialize WebSocket server
 * @param {Object} httpServer - HTTP server instance
 */
function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Get user
      const user = await User.findByPk(decoded.id);
      if (!user || !user.is_active) {
        return next(new Error('Invalid token'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id} (User: ${socket.user.id})`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to WhatsApp API Platform',
      userId: socket.user.id,
    });

    /**
     * Join session room
     * Allows client to receive session-specific events
     */
    socket.on('session:join', (sessionId) => {
      logger.debug(`User ${socket.user.id} joining session ${sessionId}`);
      socket.join(`session:${sessionId}`);
      socket.emit('session:joined', { sessionId });
    });

    /**
     * Leave session room
     */
    socket.on('session:leave', (sessionId) => {
      logger.debug(`User ${socket.user.id} leaving session ${sessionId}`);
      socket.leave(`session:${sessionId}`);
      socket.emit('session:left', { sessionId });
    });

    /**
     * Typing indicator start
     */
    socket.on('typing:start', ({ sessionId, chatId }) => {
      logger.debug(`Typing started: ${socket.user.id} in ${chatId}`);
      socket.to(`session:${sessionId}`).emit('typing:start', {
        sessionId,
        chatId,
        userId: socket.user.id,
      });
    });

    /**
     * Typing indicator stop
     */
    socket.on('typing:stop', ({ sessionId, chatId }) => {
      logger.debug(`Typing stopped: ${socket.user.id} in ${chatId}`);
      socket.to(`session:${sessionId}`).emit('typing:stop', {
        sessionId,
        chatId,
        userId: socket.user.id,
      });
    });

    /**
     * Mark message as read
     */
    socket.on('message:read', ({ sessionId, messageId }) => {
      logger.debug(`Message read: ${messageId}`);
      socket.to(`session:${sessionId}`).emit('message:read', {
        sessionId,
        messageId,
        userId: socket.user.id,
      });
    });

    /**
     * Request session status
     */
    socket.on('session:status', async ({ sessionId }) => {
      try {
        const { Session } = require('../models');
        const session = await Session.findByPk(sessionId);

        if (session && session.user_id === socket.user.id) {
          socket.emit('session:status', {
            sessionId,
            status: session.status,
            phoneNumber: session.phone_number,
            connectedAt: session.connected_at,
          });
        }
      } catch (error) {
        logger.error('Error fetching session status:', error);
        socket.emit('error', { message: 'Failed to fetch session status' });
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (Reason: ${reason})`);
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      logger.error(`WebSocket error for client ${socket.id}:`, error);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function emitToUser(userId, event, data) {
  if (!io) {
    logger.warn('WebSocket server not initialized');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
  logger.debug(`Emitted ${event} to user ${userId}`);
}

/**
 * Emit event to specific session
 * @param {string} sessionId - Session ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function emitToSession(sessionId, event, data) {
  if (!io) {
    logger.warn('WebSocket server not initialized');
    return;
  }

  io.to(`session:${sessionId}`).emit(event, data);
  logger.debug(`Emitted ${event} to session ${sessionId}`);
}

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function emitToAll(event, data) {
  if (!io) {
    logger.warn('WebSocket server not initialized');
    return;
  }

  io.emit(event, data);
  logger.debug(`Emitted ${event} to all clients`);
}

/**
 * Get connected clients count
 * @returns {number} Number of connected clients
 */
function getConnectedClientsCount() {
  if (!io) {
    return 0;
  }

  return io.engine.clientsCount;
}

/**
 * Get clients in room
 * @param {string} room - Room name
 * @returns {Set} Set of socket IDs
 */
function getClientsInRoom(room) {
  if (!io) {
    return new Set();
  }

  return io.sockets.adapter.rooms.get(room) || new Set();
}

module.exports = {
  initializeWebSocket,
  emitToUser,
  emitToSession,
  emitToAll,
  getConnectedClientsCount,
  getClientsInRoom,
};

