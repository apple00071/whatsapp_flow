/**
 * Message Service
 * Handles message operations and business logic
 */

const { Message, Session } = require('../models');
const { whatsappManager } = require('./whatsapp.service');
const { MessageMedia } = require('whatsapp-web.js');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class MessageService {
  /**
   * Send a text message
   */
  async sendText(sessionId, to, content, userId) {
    // Verify session
    const session = await Session.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (session.status !== 'connected') {
      throw new ApiError(400, 'Session is not connected');
    }

    // Get WhatsApp client
    const client = whatsappManager.getClient(sessionId);
    if (!client) {
      throw new ApiError(500, 'WhatsApp client not available');
    }

    // Format phone number
    const chatId = to.includes('@') ? to : `${to}@c.us`;

    try {
      // Send message
      const sentMessage = await client.sendMessage(chatId, content);

      // Save to database
      const message = await Message.create({
        session_id: sessionId,
        whatsapp_message_id: sentMessage.id._serialized,
        direction: 'outbound',
        from: session.phone_number,
        to,
        type: 'text',
        content,
        status: 'sent',
        sent_at: new Date(),
      });

      logger.info(`Text message sent: ${message.id}`);
      return message;
    } catch (error) {
      logger.error(`Failed to send text message: ${error.message}`);
      
      // Save failed message
      const message = await Message.create({
        session_id: sessionId,
        direction: 'outbound',
        from: session.phone_number,
        to,
        type: 'text',
        content,
        status: 'failed',
        error_message: error.message,
      });

      throw new ApiError(500, `Failed to send message: ${error.message}`);
    }
  }

  /**
   * Send a media message
   */
  async sendMedia(sessionId, to, type, mediaUrl, caption, userId) {
    // Verify session
    const session = await Session.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (session.status !== 'connected') {
      throw new ApiError(400, 'Session is not connected');
    }

    // Get WhatsApp client
    const client = whatsappManager.getClient(sessionId);
    if (!client) {
      throw new ApiError(500, 'WhatsApp client not available');
    }

    // Format phone number
    const chatId = to.includes('@') ? to : `${to}@c.us`;

    try {
      // Create media from URL
      const media = await MessageMedia.fromUrl(mediaUrl);

      // Send media message
      const sentMessage = await client.sendMessage(chatId, media, {
        caption: caption || '',
      });

      // Save to database
      const message = await Message.create({
        session_id: sessionId,
        whatsapp_message_id: sentMessage.id._serialized,
        direction: 'outbound',
        from: session.phone_number,
        to,
        type,
        media_url: mediaUrl,
        caption,
        status: 'sent',
        sent_at: new Date(),
      });

      logger.info(`Media message sent: ${message.id}`);
      return message;
    } catch (error) {
      logger.error(`Failed to send media message: ${error.message}`);
      
      // Save failed message
      const message = await Message.create({
        session_id: sessionId,
        direction: 'outbound',
        from: session.phone_number,
        to,
        type,
        media_url: mediaUrl,
        caption,
        status: 'failed',
        error_message: error.message,
      });

      throw new ApiError(500, `Failed to send media: ${error.message}`);
    }
  }

  /**
   * Send a location message
   */
  async sendLocation(sessionId, to, location, userId) {
    // Verify session
    const session = await Session.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (session.status !== 'connected') {
      throw new ApiError(400, 'Session is not connected');
    }

    // Get WhatsApp client
    const client = whatsappManager.getClient(sessionId);
    if (!client) {
      throw new ApiError(500, 'WhatsApp client not available');
    }

    // Format phone number
    const chatId = to.includes('@') ? to : `${to}@c.us`;

    try {
      // Send location
      const { Location } = require('whatsapp-web.js');
      const loc = new Location(
        location.latitude,
        location.longitude,
        location.name || ''
      );
      const sentMessage = await client.sendMessage(chatId, loc);

      // Save to database
      const message = await Message.create({
        session_id: sessionId,
        whatsapp_message_id: sentMessage.id._serialized,
        direction: 'outbound',
        from: session.phone_number,
        to,
        type: 'location',
        location,
        status: 'sent',
        sent_at: new Date(),
      });

      logger.info(`Location message sent: ${message.id}`);
      return message;
    } catch (error) {
      logger.error(`Failed to send location: ${error.message}`);
      
      // Save failed message
      const message = await Message.create({
        session_id: sessionId,
        direction: 'outbound',
        from: session.phone_number,
        to,
        type: 'location',
        location,
        status: 'failed',
        error_message: error.message,
      });

      throw new ApiError(500, `Failed to send location: ${error.message}`);
    }
  }

  /**
   * Get message history
   */
  async getHistory(sessionId, filters, userId) {
    // Verify session belongs to user
    const session = await Session.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    const where = { session_id: sessionId };

    if (filters.direction) where.direction = filters.direction;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const { count, rows: messages } = await Message.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      messages,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get message by ID
   */
  async getById(messageId, userId) {
    const message = await Message.findOne({
      where: { id: messageId },
      include: [
        {
          model: Session,
          as: 'session',
          where: { user_id: userId },
        },
      ],
    });

    if (!message) {
      throw new ApiError(404, 'Message not found');
    }

    return message;
  }

  /**
   * Update message status
   */
  async updateStatus(messageId, status, timestamp) {
    const message = await Message.findByPk(messageId);

    if (!message) {
      logger.warn(`Message not found for status update: ${messageId}`);
      return null;
    }

    const updates = { status };

    if (status === 'delivered') {
      updates.delivered_at = timestamp || new Date();
    } else if (status === 'read') {
      updates.read_at = timestamp || new Date();
    }

    await message.update(updates);
    logger.info(`Message status updated: ${messageId} -> ${status}`);

    return message;
  }

  /**
   * Delete message
   */
  async delete(messageId, userId) {
    const message = await Message.findOne({
      where: { id: messageId },
      include: [
        {
          model: Session,
          as: 'session',
          where: { user_id: userId },
        },
      ],
    });

    if (!message) {
      throw new ApiError(404, 'Message not found');
    }

    await message.destroy();
    logger.info(`Message deleted: ${messageId}`);

    return true;
  }
}

module.exports = new MessageService();

