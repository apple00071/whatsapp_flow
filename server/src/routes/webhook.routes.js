/**
 * Webhook Routes
 * Handles webhook management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate, requireScope } = require('../middleware/auth');
const webhookController = require('../controllers/webhook.controller');

/**
 * @route   GET /api/v1/webhooks
 * @desc    List all webhooks for user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  requireScope('webhooks:read'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationHandler,
  asyncHandler(webhookController.listWebhooks)
);

/**
 * @route   GET /api/v1/webhooks/:id
 * @desc    Get webhook by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  requireScope('webhooks:read'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
  ],
  validationHandler,
  asyncHandler(webhookController.getWebhook)
);

/**
 * @route   POST /api/v1/webhooks
 * @desc    Create a new webhook
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  requireScope('webhooks:write'),
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('events').isArray({ min: 1 }).withMessage('At least one event is required'),
    body('secret').optional().trim(),
  ],
  validationHandler,
  asyncHandler(webhookController.createWebhook)
);

/**
 * @route   PUT /api/v1/webhooks/:id
 * @desc    Update webhook
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  requireScope('webhooks:write'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
    body('url').optional().isURL().withMessage('Valid URL is required'),
    body('events').optional().isArray({ min: 1 }).withMessage('At least one event is required'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  ],
  validationHandler,
  asyncHandler(webhookController.updateWebhook)
);

/**
 * @route   DELETE /api/v1/webhooks/:id
 * @desc    Delete webhook
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  requireScope('webhooks:write'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
  ],
  validationHandler,
  asyncHandler(webhookController.deleteWebhook)
);

/**
 * @route   POST /api/v1/webhooks/:id/regenerate-secret
 * @desc    Regenerate webhook secret
 * @access  Private
 */
router.post(
  '/:id/regenerate-secret',
  authenticate,
  requireScope('webhooks:write'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
  ],
  validationHandler,
  asyncHandler(webhookController.regenerateSecret)
);

/**
 * @route   POST /api/v1/webhooks/:id/test
 * @desc    Test webhook delivery
 * @access  Private
 */
router.post(
  '/:id/test',
  authenticate,
  requireScope('webhooks:write'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
  ],
  validationHandler,
  asyncHandler(webhookController.testWebhook)
);

/**
 * @route   GET /api/v1/webhooks/:id/logs
 * @desc    Get webhook delivery logs
 * @access  Private
 */
router.get(
  '/:id/logs',
  authenticate,
  requireScope('webhooks:read'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationHandler,
  asyncHandler(webhookController.getWebhookLogs)
);

/**
 * @route   POST /api/v1/webhooks/:id/reset-failures
 * @desc    Reset webhook failure count
 * @access  Private
 */
router.post(
  '/:id/reset-failures',
  authenticate,
  requireScope('webhooks:write'),
  [
    param('id').isUUID().withMessage('Invalid webhook ID'),
  ],
  validationHandler,
  asyncHandler(webhookController.resetFailures)
);

module.exports = router;

