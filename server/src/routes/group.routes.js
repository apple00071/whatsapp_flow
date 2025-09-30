/**
 * Group Routes
 * Handles WhatsApp group management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate, requireScope } = require('../middleware/auth');
const groupController = require('../controllers/group.controller');

/**
 * @route   GET /api/v1/groups
 * @desc    List all groups for a session
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  requireScope('groups:read'),
  [
    query('session_id').isUUID().withMessage('Valid session ID is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  validationHandler,
  asyncHandler(groupController.listGroups)
);

/**
 * @route   GET /api/v1/groups/:id
 * @desc    Get group by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  requireScope('groups:read'),
  [
    param('id').isUUID().withMessage('Invalid group ID'),
  ],
  validationHandler,
  asyncHandler(groupController.getGroup)
);

/**
 * @route   POST /api/v1/groups/sync
 * @desc    Sync groups from WhatsApp
 * @access  Private
 */
router.post(
  '/sync',
  authenticate,
  requireScope('groups:write'),
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
  ],
  validationHandler,
  asyncHandler(groupController.syncGroups)
);

/**
 * @route   POST /api/v1/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  requireScope('groups:write'),
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  ],
  validationHandler,
  asyncHandler(groupController.createGroup)
);

/**
 * @route   PUT /api/v1/groups/:id
 * @desc    Update group settings
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  requireScope('groups:write'),
  [
    param('id').isUUID().withMessage('Invalid group ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim(),
  ],
  validationHandler,
  asyncHandler(groupController.updateGroup)
);

/**
 * @route   POST /api/v1/groups/:id/participants
 * @desc    Add participants to group
 * @access  Private
 */
router.post(
  '/:id/participants',
  authenticate,
  requireScope('groups:write'),
  [
    param('id').isUUID().withMessage('Invalid group ID'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  ],
  validationHandler,
  asyncHandler(groupController.addParticipants)
);

/**
 * @route   DELETE /api/v1/groups/:id/participants
 * @desc    Remove participants from group
 * @access  Private
 */
router.delete(
  '/:id/participants',
  authenticate,
  requireScope('groups:write'),
  [
    param('id').isUUID().withMessage('Invalid group ID'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  ],
  validationHandler,
  asyncHandler(groupController.removeParticipants)
);

/**
 * @route   POST /api/v1/groups/:id/leave
 * @desc    Leave group
 * @access  Private
 */
router.post(
  '/:id/leave',
  authenticate,
  requireScope('groups:write'),
  [
    param('id').isUUID().withMessage('Invalid group ID'),
  ],
  validationHandler,
  asyncHandler(groupController.leaveGroup)
);

module.exports = router;

