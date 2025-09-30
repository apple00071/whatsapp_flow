/**
 * Message Routes
 * Handles sending and retrieving WhatsApp messages
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler, ApiError } = require('../middleware/errorHandler');
const { authenticate, requireScope } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const { whatsappManager } = require('../services/whatsapp.service');
const { Message, Session } = require('../models');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * @route   POST /api/v1/messages/send
 * @desc    Send a text message
 * @access  Private
 */
router.post(
  '/send',
  authenticate,
  requireScope('messages:write'),
  rateLimiter.messages,
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('to').notEmpty().withMessage('Recipient phone number is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { session_id, to, content } = req.body;

    // Verify session belongs to user
    const session = await Session.findOne({
      where: {
        id: session_id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (session.status !== 'connected') {
      throw new ApiError(400, 'Session is not connected');
    }

    // Get WhatsApp client
    const client = whatsappManager.getClient(session_id);

    // Format phone number (add @c.us if not present)
    const chatId = to.includes('@') ? to : `${to}@c.us`;

    // Send message
    const sentMessage = await client.sendMessage(chatId, content);

    // Save to database
    const message = await Message.create({
      session_id,
      whatsapp_message_id: sentMessage.id._serialized,
      direction: 'outbound',
      from: session.phone_number,
      to,
      type: 'text',
      content,
      status: 'sent',
      sent_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  })
);

/**
 * @route   POST /api/v1/messages/media
 * @desc    Send a media message (image, video, document, audio)
 * @access  Private
 */
router.post(
  '/media',
  authenticate,
  requireScope('messages:write'),
  rateLimiter.messages,
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('to').notEmpty().withMessage('Recipient phone number is required'),
    body('type').isIn(['image', 'video', 'audio', 'document']).withMessage('Invalid media type'),
    body('media_url').notEmpty().withMessage('Media URL is required'),
    body('caption').optional().trim(),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { session_id, to, type, media_url, caption } = req.body;

    // Verify session
    const session = await Session.findOne({
      where: {
        id: session_id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (session.status !== 'connected') {
      throw new ApiError(400, 'Session is not connected');
    }

    // Get WhatsApp client
    const client = whatsappManager.getClient(session_id);

    // Format phone number
    const chatId = to.includes('@') ? to : `${to}@c.us`;

    // Create media from URL
    const media = await MessageMedia.fromUrl(media_url);

    // Send media message
    const sentMessage = await client.sendMessage(chatId, media, {
      caption: caption || '',
    });

    // Save to database
    const message = await Message.create({
      session_id,
      whatsapp_message_id: sentMessage.id._serialized,
      direction: 'outbound',
      from: session.phone_number,
      to,
      type,
      media_url,
      caption,
      status: 'sent',
      sent_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Media message sent successfully',
      data: message,
    });
  })
);

/**
 * @route   POST /api/v1/messages/location
 * @desc    Send a location message
 * @access  Private
 */
router.post(
  '/location',
  authenticate,
  requireScope('messages:write'),
  rateLimiter.messages,
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('to').notEmpty().withMessage('Recipient phone number is required'),
    body('location.latitude').isFloat().withMessage('Valid latitude is required'),
    body('location.longitude').isFloat().withMessage('Valid longitude is required'),
    body('location.name').optional().trim(),
    body('location.address').optional().trim(),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { session_id, to, location } = req.body;

    // Verify session
    const session = await Session.findOne({
      where: {
        id: session_id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    if (session.status !== 'connected') {
      throw new ApiError(400, 'Session is not connected');
    }

    // Get WhatsApp client
    const client = whatsappManager.getClient(session_id);

    // Format phone number
    const chatId = to.includes('@') ? to : `${to}@c.us`;

    // Send location
    const { Location } = require('whatsapp-web.js');
    const loc = new Location(location.latitude, location.longitude, location.name || '');
    const sentMessage = await client.sendMessage(chatId, loc);

    // Save to database
    const message = await Message.create({
      session_id,
      whatsapp_message_id: sentMessage.id._serialized,
      direction: 'outbound',
      from: session.phone_number,
      to,
      type: 'location',
      location,
      status: 'sent',
      sent_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Location sent successfully',
      data: message,
    });
  })
);

/**
 * @route   GET /api/v1/messages
 * @desc    Get message history with pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  requireScope('messages:read'),
  [
    query('session_id').optional().isUUID().withMessage('Invalid session ID'),
    query('direction').optional().isIn(['inbound', 'outbound']),
    query('type').optional().isIn(['text', 'image', 'video', 'audio', 'document', 'location', 'contact']),
    query('status').optional().isIn(['pending', 'sent', 'delivered', 'read', 'failed']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Filter by session (must belong to user)
    if (req.query.session_id) {
      const session = await Session.findOne({
        where: {
          id: req.query.session_id,
          user_id: req.user.id,
        },
      });

      if (!session) {
        throw new ApiError(404, 'Session not found');
      }

      where.session_id = req.query.session_id;
    } else {
      // Get all user's sessions
      const sessions = await Session.findAll({
        where: { user_id: req.user.id },
        attributes: ['id'],
      });

      where.session_id = sessions.map((s) => s.id);
    }

    if (req.query.direction) where.direction = req.query.direction;
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;

    const { count, rows: messages } = await Message.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Session,
          as: 'session',
          attributes: ['id', 'name', 'phone_number'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  })
);

/**
 * @route   GET /api/v1/messages/:id
 * @desc    Get message details
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  requireScope('messages:read'),
  [
    param('id').isUUID().withMessage('Invalid message ID'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const message = await Message.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Session,
          as: 'session',
          where: { user_id: req.user.id },
        },
      ],
    });

    if (!message) {
      throw new ApiError(404, 'Message not found');
    }

    res.json({
      success: true,
      data: message,
    });
  })
);

/**
 * @route   GET /api/v1/messages/:id/status
 * @desc    Get message delivery status
 * @access  Private
 */
router.get(
  '/:id/status',
  authenticate,
  requireScope('messages:read'),
  [
    param('id').isUUID().withMessage('Invalid message ID'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const message = await Message.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Session,
          as: 'session',
          where: { user_id: req.user.id },
        },
      ],
    });

    if (!message) {
      throw new ApiError(404, 'Message not found');
    }

    res.json({
      success: true,
      data: {
        id: message.id,
        status: message.status,
        sent_at: message.sent_at,
        delivered_at: message.delivered_at,
        read_at: message.read_at,
        error_message: message.error_message,
      },
    });
  })
);

module.exports = router;

