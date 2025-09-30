/**
 * User Routes
 * Handles user profile and account management
 */

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(userController.getProfile)
);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  [
    body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().trim(),
    body('company').optional().trim(),
    body('timezone').optional().trim(),
  ],
  validationHandler,
  asyncHandler(userController.updateProfile)
);

/**
 * @route   PUT /api/v1/users/me/email
 * @desc    Update user email
 * @access  Private
 */
router.put(
  '/me/email',
  authenticate,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validationHandler,
  asyncHandler(userController.updateEmail)
);

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/me',
  authenticate,
  [
    body('password').notEmpty().withMessage('Password is required for account deletion'),
  ],
  validationHandler,
  asyncHandler(userController.deleteAccount)
);

/**
 * @route   GET /api/v1/users/me/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get(
  '/me/preferences',
  authenticate,
  asyncHandler(userController.getPreferences)
);

/**
 * @route   PUT /api/v1/users/me/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put(
  '/me/preferences',
  authenticate,
  [
    body('preferences').isObject().withMessage('Preferences must be an object'),
  ],
  validationHandler,
  asyncHandler(userController.updatePreferences)
);

/**
 * @route   GET /api/v1/users/me/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get(
  '/me/activity',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationHandler,
  asyncHandler(userController.getActivityLog)
);

/**
 * @route   GET /api/v1/users/me/usage
 * @desc    Get user usage statistics
 * @access  Private
 */
router.get(
  '/me/usage',
  authenticate,
  asyncHandler(userController.getUsageStats)
);

module.exports = router;

