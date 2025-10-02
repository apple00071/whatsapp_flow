/**
 * WhatsApp Service
 * Manages WhatsApp Web client instances and message operations
 * Uses whatsapp-web.js library for WhatsApp integration
 */

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { Session, Message } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');
const webhookService = require('./webhook.service');

/**
 * WhatsApp Manager Class
 * Manages multiple WhatsApp client instances
 */
class WhatsAppManager {
  constructor() {
    this.clients = new Map(); // sessionId -> Client instance
    this.qrCodes = new Map(); // sessionId -> QR code data
  }

  /**
   * Initialize WhatsApp manager
   * Restore existing sessions from database
   */
  async initialize() {
    try {
      logger.info('Initializing WhatsApp manager...');
      
      // Ensure session directory exists
      if (!fs.existsSync(config.whatsapp.sessionPath)) {
        fs.mkdirSync(config.whatsapp.sessionPath, { recursive: true });
      }

      // Restore active sessions
      const activeSessions = await Session.findAll({
        where: {
          is_active: true,
          status: 'connected',
        },
      });

      logger.info(`Found ${activeSessions.length} active sessions to restore`);

      for (const session of activeSessions) {
        try {
          await this.createClient(session.id, session.user_id);
        } catch (error) {
          logger.error(`Failed to restore session ${session.id}:`, error);
        }
      }

      logger.info('WhatsApp manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WhatsApp manager:', error);
      throw error;
    }
  }

  /**
   * Create a new WhatsApp client instance
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Promise<Client>} WhatsApp client instance
   */
  async createClient(sessionId, userId) {
    // Check if client already exists
    if (this.clients.has(sessionId)) {
      return this.clients.get(sessionId);
    }

    // Check session limit
    const userSessions = Array.from(this.clients.values()).filter(
      (client) => client.userId === userId
    );
    
    if (userSessions.length >= config.whatsapp.maxSessions) {
      throw new ApiError(429, `Maximum ${config.whatsapp.maxSessions} sessions allowed`);
    }

    logger.info(`Creating WhatsApp client for session ${sessionId}`);

    // Create client with local authentication
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: config.whatsapp.sessionPath,
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    // Store user ID for session management
    client.userId = userId;
    client.sessionId = sessionId;

    // Set up event handlers
    this.setupEventHandlers(client, sessionId);

    // Initialize client
    await client.initialize();

    // Store client
    this.clients.set(sessionId, client);

    return client;
  }

  /**
   * Set up event handlers for WhatsApp client
   * @param {Client} client - WhatsApp client instance
   * @param {string} sessionId - Session ID
   */
  setupEventHandlers(client, sessionId) {
    // QR code event
    client.on('qr', async (qr) => {
      logger.info(`QR code generated for session ${sessionId}`);

      try {
        // Store raw QR string (not data URL)
        this.qrCodes.set(sessionId, qr);

        // Update session in database
        await Session.update(
          {
            status: 'qr',
            qr_code: qr,
            qr_expires_at: new Date(Date.now() + 60000), // 1 minute
          },
          { where: { id: sessionId } }
        );

        // Emit webhook event
        await webhookService.emitEvent(sessionId, 'session.qr', {
          sessionId,
          qrCode: qr,
        });
      } catch (error) {
        logger.error(`Error handling QR code for session ${sessionId}:`, error);
      }
    });

    // Ready event (connected)
    client.on('ready', async () => {
      logger.info(`WhatsApp client ready for session ${sessionId}`);
      
      try {
        // Get phone number
        const info = client.info;
        
        // Update session in database
        await Session.update(
          {
            status: 'connected',
            phone_number: info.wid.user,
            connected_at: new Date(),
            qr_code: null,
            last_seen: new Date(),
          },
          { where: { id: sessionId } }
        );

        // Clear QR code
        this.qrCodes.delete(sessionId);

        // Emit webhook event
        await webhookService.emitEvent(sessionId, 'session.connected', {
          sessionId,
          phoneNumber: info.wid.user,
        });
      } catch (error) {
        logger.error(`Error handling ready event for session ${sessionId}:`, error);
      }
    });

    // Message received event
    client.on('message', async (message) => {
      logger.debug(`Message received for session ${sessionId}`);
      
      try {
        // Save message to database
        await this.saveIncomingMessage(sessionId, message);

        // Emit webhook event
        await webhookService.emitEvent(sessionId, 'message.received', {
          sessionId,
          from: message.from,
          body: message.body,
          type: message.type,
          timestamp: message.timestamp,
        });

        // AI_INTEGRATION_POINT: Process message for auto-reply
        // if (config.ai.enableAutoReply) {
        //   const reply = await aiService.generateAutoReply(message.body);
        //   if (reply) {
        //     await client.sendMessage(message.from, reply);
        //   }
        // }

        // AI_INTEGRATION_POINT: Analyze sentiment
        // if (config.ai.enableSentimentAnalysis) {
        //   const sentiment = await aiService.analyzeSentiment(message.body);
        //   await Message.update({ ai_sentiment: sentiment }, { where: { whatsapp_message_id: message.id._serialized } });
        // }

        // AI_INTEGRATION_POINT: Detect spam
        // if (config.ai.enableSpamDetection) {
        //   const spamScore = await aiService.detectSpam(message.body);
        //   await Message.update({ ai_spam_score: spamScore }, { where: { whatsapp_message_id: message.id._serialized } });
        // }
      } catch (error) {
        logger.error(`Error handling message for session ${sessionId}:`, error);
      }
    });

    // Message acknowledgement event
    client.on('message_ack', async (message, ack) => {
      logger.debug(`Message ACK for session ${sessionId}: ${ack}`);
      
      try {
        // Update message status
        let status = 'pending';
        if (ack === 1) status = 'sent';
        else if (ack === 2) status = 'delivered';
        else if (ack === 3) status = 'read';

        await Message.update(
          { status },
          { where: { whatsapp_message_id: message.id._serialized } }
        );

        // Emit webhook event
        await webhookService.emitEvent(sessionId, 'message.status', {
          sessionId,
          messageId: message.id._serialized,
          status,
        });
      } catch (error) {
        logger.error(`Error handling message ACK for session ${sessionId}:`, error);
      }
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      logger.warn(`WhatsApp client disconnected for session ${sessionId}: ${reason}`);
      
      try {
        // Update session in database
        await Session.update(
          {
            status: 'disconnected',
            disconnected_at: new Date(),
          },
          { where: { id: sessionId } }
        );

        // Remove client
        this.clients.delete(sessionId);

        // Emit webhook event
        await webhookService.emitEvent(sessionId, 'session.disconnected', {
          sessionId,
          reason,
        });
      } catch (error) {
        logger.error(`Error handling disconnection for session ${sessionId}:`, error);
      }
    });

    // Authentication failure event
    client.on('auth_failure', async (message) => {
      logger.error(`Authentication failed for session ${sessionId}: ${message}`);
      
      try {
        await Session.update(
          {
            status: 'failed',
          },
          { where: { id: sessionId } }
        );

        this.clients.delete(sessionId);
      } catch (error) {
        logger.error(`Error handling auth failure for session ${sessionId}:`, error);
      }
    });
  }

  /**
   * Save incoming message to database
   * @param {string} sessionId - Session ID
   * @param {Object} message - WhatsApp message object
   */
  async saveIncomingMessage(sessionId, message) {
    const messageData = {
      session_id: sessionId,
      whatsapp_message_id: message.id._serialized,
      direction: 'inbound',
      from: message.from,
      to: message.to,
      type: message.type,
      content: message.body,
      status: 'delivered',
      delivered_at: new Date(message.timestamp * 1000),
    };

    // Handle media messages
    if (message.hasMedia) {
      try {
        const media = await message.downloadMedia();
        // TODO: Upload media to storage and get URL
        messageData.media_mime_type = media.mimetype;
      } catch (error) {
        logger.error('Error downloading media:', error);
      }
    }

    await Message.create(messageData);
  }

  /**
   * Get client by session ID
   * @param {string} sessionId - Session ID
   * @returns {Client} WhatsApp client instance
   */
  getClient(sessionId) {
    const client = this.clients.get(sessionId);
    if (!client) {
      throw new ApiError(404, 'Session not found or not connected');
    }
    return client;
  }

  /**
   * Destroy client
   * @param {string} sessionId - Session ID
   */
  async destroyClient(sessionId) {
    const client = this.clients.get(sessionId);
    if (client) {
      await client.destroy();
      this.clients.delete(sessionId);
      this.qrCodes.delete(sessionId);
    }
  }

  /**
   * Get QR code for session
   * @param {string} sessionId - Session ID
   * @returns {string} QR code data URL
   */
  getQRCode(sessionId) {
    return this.qrCodes.get(sessionId);
  }
}

// Create singleton instance
const whatsappManager = new WhatsAppManager();

/**
 * Initialize WhatsApp manager
 */
async function initializeWhatsAppManager() {
  await whatsappManager.initialize();
}

module.exports = {
  whatsappManager,
  initializeWhatsAppManager,
};

