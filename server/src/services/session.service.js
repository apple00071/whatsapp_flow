/**
 * Session Service
 * Handles session lifecycle management
 */

const { Session } = require('../models');
const { whatsappManager } = require('./whatsapp.service');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class SessionService {
  /**
   * Create a new session
   */
  async create(userId, name) {
    // Check session limit for user
    const userSessionCount = await Session.count({
      where: { user_id: userId },
    });

    const maxSessions = 10; // TODO: Make this configurable per user/plan

    if (userSessionCount >= maxSessions) {
      throw new ApiError(400, `Maximum session limit reached (${maxSessions})`);
    }

    // Create session in database
    const session = await Session.create({
      user_id: userId,
      name,
      status: 'initializing',
    });

    try {
      // Initialize WhatsApp client
      await whatsappManager.createClient(session.id, userId);
      logger.info(`Session created: ${session.id}`);
      
      return session;
    } catch (error) {
      // If client creation fails, update session status
      await session.update({ status: 'failed' });
      logger.error(`Failed to create session: ${error.message}`);
      throw new ApiError(500, `Failed to initialize session: ${error.message}`);
    }
  }

  /**
   * Get session by ID
   */
  async getById(sessionId, userId) {
    const session = await Session.findOne({
      where: {
        id: sessionId,
        user_id: userId,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    return session;
  }

  /**
   * List all sessions for user
   */
  async list(userId, filters = {}) {
    const where = { user_id: userId };

    if (filters.status) {
      where.status = filters.status;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const { count, rows: sessions } = await Session.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      sessions,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Update session
   */
  async update(sessionId, userId, updates) {
    const session = await this.getById(sessionId, userId);

    const allowedUpdates = ['name', 'webhook_url', 'webhook_events', 'settings'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === 'settings') {
          filteredUpdates[key] = { ...session.settings, ...updates[key] };
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    await session.update(filteredUpdates);
    logger.info(`Session updated: ${sessionId}`);

    return session;
  }

  /**
   * Delete session
   */
  async delete(sessionId, userId) {
    const session = await this.getById(sessionId, userId);

    // Destroy WhatsApp client
    await whatsappManager.destroyClient(sessionId);

    // Delete session from database
    await session.destroy();
    logger.info(`Session deleted: ${sessionId}`);

    return true;
  }

  /**
   * Reconnect session
   */
  async reconnect(sessionId, userId) {
    const session = await this.getById(sessionId, userId);

    // Destroy existing client if any
    await whatsappManager.destroyClient(sessionId);

    // Update session status
    await session.update({ status: 'initializing' });

    try {
      // Create new client
      await whatsappManager.createClient(sessionId, userId);
      logger.info(`Session reconnected: ${sessionId}`);

      return session;
    } catch (error) {
      await session.update({ status: 'failed' });
      logger.error(`Failed to reconnect session: ${error.message}`);
      throw new ApiError(500, `Failed to reconnect session: ${error.message}`);
    }
  }

  /**
   * Get QR code for session
   */
  async getQRCode(sessionId, userId) {
    const session = await this.getById(sessionId, userId);

    // Get QR code from manager
    const qrCode = whatsappManager.getQRCode(sessionId);

    return {
      sessionId: session.id,
      status: session.status,
      qrCode: qrCode || session.qr_code,
      expiresAt: session.qr_expires_at,
    };
  }

  /**
   * Update session status
   */
  async updateStatus(sessionId, status, additionalData = {}) {
    const session = await Session.findByPk(sessionId);

    if (!session) {
      logger.warn(`Session not found for status update: ${sessionId}`);
      return null;
    }

    const updates = { status, ...additionalData };

    await session.update(updates);
    logger.info(`Session status updated: ${sessionId} -> ${status}`);

    return session;
  }

  /**
   * Get session statistics
   */
  async getStats(sessionId, userId) {
    const session = await this.getById(sessionId, userId);

    const { Message } = require('../models');
    const { Op } = require('sequelize');

    // Get message counts
    const totalMessages = await Message.count({
      where: { session_id: sessionId },
    });

    const sentMessages = await Message.count({
      where: { session_id: sessionId, direction: 'outbound' },
    });

    const receivedMessages = await Message.count({
      where: { session_id: sessionId, direction: 'inbound' },
    });

    // Get messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesToday = await Message.count({
      where: {
        session_id: sessionId,
        created_at: { [Op.gte]: today },
      },
    });

    return {
      session: {
        id: session.id,
        name: session.name,
        status: session.status,
        phone_number: session.phone_number,
        created_at: session.created_at,
      },
      messages: {
        total: totalMessages,
        sent: sentMessages,
        received: receivedMessages,
        today: messagesToday,
      },
    };
  }

  /**
   * Check if session is connected
   */
  async isConnected(sessionId) {
    const session = await Session.findByPk(sessionId);
    return session && session.status === 'connected';
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions() {
    const sessions = await Session.findAll({
      where: { status: 'connected' },
    });

    return sessions;
  }

  /**
   * Cleanup disconnected sessions
   */
  async cleanupDisconnected() {
    const disconnectedSessions = await Session.findAll({
      where: {
        status: 'disconnected',
        updated_at: {
          [require('sequelize').Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    for (const session of disconnectedSessions) {
      await whatsappManager.destroyClient(session.id);
    }

    logger.info(`Cleaned up ${disconnectedSessions.length} disconnected sessions`);
    return disconnectedSessions.length;
  }
}

module.exports = new SessionService();

