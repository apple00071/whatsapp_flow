/**
 * Admin Routes
 * Handles admin operations and platform management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// All admin routes require admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Admin
 */
router.get(
  '/stats',
  asyncHandler(adminController.getPlatformStats)
);

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users
 * @access  Admin
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('role').optional().isIn(['user', 'admin', 'developer']),
  ],
  validationHandler,
  asyncHandler(adminController.listUsers)
);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user details
 * @access  Admin
 */
router.get(
  '/users/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
  ],
  validationHandler,
  asyncHandler(adminController.getUser)
);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put(
  '/users/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('role').optional().isIn(['user', 'admin', 'developer']),
    body('is_active').optional().isBoolean(),
    body('email_verified').optional().isBoolean(),
  ],
  validationHandler,
  asyncHandler(adminController.updateUser)
);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete(
  '/users/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
  ],
  validationHandler,
  asyncHandler(adminController.deleteUser)
);

/**
 * @route   POST /api/v1/admin/users/:id/reset-password
 * @desc    Reset user password
 * @access  Admin
 */
router.post(
  '/users/:id/reset-password',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validationHandler,
  asyncHandler(adminController.resetUserPassword)
);

/**
 * @route   GET /api/v1/admin/sessions
 * @desc    List all sessions
 * @access  Admin
 */
router.get(
  '/sessions',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['initializing', 'qr', 'connected', 'disconnected', 'failed']),
  ],
  validationHandler,
  asyncHandler(adminController.listAllSessions)
);

/**
 * @route   POST /api/v1/admin/sessions/:id/terminate
 * @desc    Terminate session
 * @access  Admin
 */
router.post(
  '/sessions/:id/terminate',
  [
    param('id').isUUID().withMessage('Invalid session ID'),
  ],
  validationHandler,
  asyncHandler(adminController.terminateSession)
);

/**
 * @route   GET /api/v1/admin/health
 * @desc    Get system health
 * @access  Admin
 */
router.get(
  '/health',
  asyncHandler(adminController.getSystemHealth)
);

/**
 * @route   GET /api/v1/admin/activity
 * @desc    Get activity logs
 * @access  Admin
 */
router.get(
  '/activity',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationHandler,
  asyncHandler(adminController.getActivityLogs)
);

module.exports = router;

