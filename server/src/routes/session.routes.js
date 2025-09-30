/**
 * Session Routes
 * Handles WhatsApp session management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate, requireScope } = require('../middleware/auth');
const { whatsappManager } = require('../services/whatsapp.service');
const { Session } = require('../models');

/**
 * @route   POST /api/v1/sessions
 * @desc    Create a new WhatsApp session
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  requireScope('sessions:write'),
  [
    body('name').trim().notEmpty().withMessage('Session name is required'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { name } = req.body;

    // Create session in database
    const session = await Session.create({
      user_id: req.user.id,
      name,
      status: 'initializing',
    });

    // Initialize WhatsApp client
    try {
      await whatsappManager.createClient(session.id, req.user.id);
    } catch (error) {
      // If client creation fails, update session status
      await session.update({ status: 'failed' });
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session,
    });
  })
);

/**
 * @route   GET /api/v1/sessions
 * @desc    List all sessions for authenticated user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  requireScope('sessions:read'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['initializing', 'qr', 'connected', 'disconnected', 'failed']),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    
    if (req.query.status) {
      where.status = req.query.status;
    }

    const { count, rows: sessions } = await Session.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        sessions,
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
 * @route   GET /api/v1/sessions/:id
 * @desc    Get session details
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  requireScope('sessions:read'),
  [
    param('id').isUUID().withMessage('Invalid session ID'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    res.json({
      success: true,
      data: session,
    });
  })
);

/**
 * @route   GET /api/v1/sessions/:id/qr
 * @desc    Get QR code for session
 * @access  Private
 */
router.get(
  '/:id/qr',
  authenticate,
  requireScope('sessions:read'),
  [
    param('id').isUUID().withMessage('Invalid session ID'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    // Get QR code from manager
    const qrCode = whatsappManager.getQRCode(session.id);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        qrCode: qrCode || session.qr_code,
        expiresAt: session.qr_expires_at,
      },
    });
  })
);

/**
 * @route   POST /api/v1/sessions/:id/reconnect
 * @desc    Reconnect a disconnected session
 * @access  Private
 */
router.post(
  '/:id/reconnect',
  authenticate,
  requireScope('sessions:write'),
  [
    param('id').isUUID().withMessage('Invalid session ID'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    // Destroy existing client if any
    await whatsappManager.destroyClient(session.id);

    // Update session status
    await session.update({ status: 'initializing' });

    // Create new client
    await whatsappManager.createClient(session.id, req.user.id);

    res.json({
      success: true,
      message: 'Session reconnection initiated',
      data: session,
    });
  })
);

/**
 * @route   PUT /api/v1/sessions/:id
 * @desc    Update session settings
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  requireScope('sessions:write'),
  [
    param('id').isUUID().withMessage('Invalid session ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('webhook_url').optional().isURL().withMessage('Invalid webhook URL'),
    body('webhook_events').optional().isArray().withMessage('Webhook events must be an array'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.webhook_url !== undefined) updates.webhook_url = req.body.webhook_url;
    if (req.body.webhook_events) updates.webhook_events = req.body.webhook_events;
    if (req.body.settings) updates.settings = { ...session.settings, ...req.body.settings };

    await session.update(updates);

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: session,
    });
  })
);

/**
 * @route   DELETE /api/v1/sessions/:id
 * @desc    Delete/terminate a session
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  requireScope('sessions:write'),
  [
    param('id').isUUID().withMessage('Invalid session ID'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    // Destroy WhatsApp client
    await whatsappManager.destroyClient(session.id);

    // Delete session from database
    await session.destroy();

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  })
);

module.exports = router;

