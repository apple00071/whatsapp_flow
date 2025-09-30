/**
 * API Key Routes
 * Handles API key management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const apiKeyController = require('../controllers/apiKey.controller');

/**
 * @route   GET /api/v1/api-keys
 * @desc    List all API keys for user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationHandler,
  asyncHandler(apiKeyController.listApiKeys)
);

/**
 * @route   GET /api/v1/api-keys/:id
 * @desc    Get API key by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid API key ID'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.getApiKey)
);

/**
 * @route   POST /api/v1/api-keys
 * @desc    Create a new API key
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  rateLimiter.apiKeyCreation,
  [
    body('name').trim().notEmpty().withMessage('API key name is required'),
    body('scopes').isArray({ min: 1 }).withMessage('At least one scope is required'),
    body('expires_at').optional().isISO8601().withMessage('Valid expiration date is required'),
    body('rate_limit').optional().isInt({ min: 1 }).withMessage('Rate limit must be a positive integer'),
    body('ip_whitelist').optional().isArray().withMessage('IP whitelist must be an array'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.createApiKey)
);

/**
 * @route   PUT /api/v1/api-keys/:id
 * @desc    Update API key
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid API key ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('scopes').optional().isArray({ min: 1 }).withMessage('At least one scope is required'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('rate_limit').optional().isInt({ min: 1 }).withMessage('Rate limit must be a positive integer'),
    body('ip_whitelist').optional().isArray().withMessage('IP whitelist must be an array'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.updateApiKey)
);

/**
 * @route   DELETE /api/v1/api-keys/:id
 * @desc    Delete API key
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid API key ID'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.deleteApiKey)
);

/**
 * @route   POST /api/v1/api-keys/:id/revoke
 * @desc    Revoke API key
 * @access  Private
 */
router.post(
  '/:id/revoke',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid API key ID'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.revokeApiKey)
);

/**
 * @route   POST /api/v1/api-keys/:id/regenerate
 * @desc    Regenerate API key
 * @access  Private
 */
router.post(
  '/:id/regenerate',
  authenticate,
  rateLimiter.apiKeyCreation,
  [
    param('id').isUUID().withMessage('Invalid API key ID'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.regenerateApiKey)
);

/**
 * @route   GET /api/v1/api-keys/:id/stats
 * @desc    Get API key usage statistics
 * @access  Private
 */
router.get(
  '/:id/stats',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid API key ID'),
  ],
  validationHandler,
  asyncHandler(apiKeyController.getApiKeyStats)
);

module.exports = router;

