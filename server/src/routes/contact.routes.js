/**
 * Contact Routes
 * Handles contact management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { authenticate, requireScope } = require('../middleware/auth');
const contactController = require('../controllers/contact.controller');

/**
 * @route   GET /api/v1/contacts
 * @desc    List all contacts for a session
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  requireScope('contacts:read'),
  [
    query('session_id').isUUID().withMessage('Valid session ID is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  validationHandler,
  asyncHandler(contactController.listContacts)
);

/**
 * @route   GET /api/v1/contacts/:id
 * @desc    Get contact by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  requireScope('contacts:read'),
  [
    param('id').isUUID().withMessage('Invalid contact ID'),
  ],
  validationHandler,
  asyncHandler(contactController.getContact)
);

/**
 * @route   POST /api/v1/contacts
 * @desc    Create a new contact
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  requireScope('contacts:write'),
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('labels').optional().isArray().withMessage('Labels must be an array'),
    body('custom_fields').optional().isObject().withMessage('Custom fields must be an object'),
  ],
  validationHandler,
  asyncHandler(contactController.createContact)
);

/**
 * @route   PUT /api/v1/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  requireScope('contacts:write'),
  [
    param('id').isUUID().withMessage('Invalid contact ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('labels').optional().isArray().withMessage('Labels must be an array'),
    body('custom_fields').optional().isObject().withMessage('Custom fields must be an object'),
  ],
  validationHandler,
  asyncHandler(contactController.updateContact)
);

/**
 * @route   DELETE /api/v1/contacts/:id
 * @desc    Delete contact
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  requireScope('contacts:write'),
  [
    param('id').isUUID().withMessage('Invalid contact ID'),
  ],
  validationHandler,
  asyncHandler(contactController.deleteContact)
);

/**
 * @route   POST /api/v1/contacts/sync
 * @desc    Sync contacts from WhatsApp
 * @access  Private
 */
router.post(
  '/sync',
  authenticate,
  requireScope('contacts:write'),
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
  ],
  validationHandler,
  asyncHandler(contactController.syncContacts)
);

/**
 * @route   POST /api/v1/contacts/import
 * @desc    Bulk import contacts
 * @access  Private
 */
router.post(
  '/import',
  authenticate,
  requireScope('contacts:write'),
  [
    body('session_id').isUUID().withMessage('Valid session ID is required'),
    body('contacts').isArray().withMessage('Contacts must be an array'),
    body('contacts.*.phone_number').notEmpty().withMessage('Phone number is required'),
    body('contacts.*.name').notEmpty().withMessage('Name is required'),
  ],
  validationHandler,
  asyncHandler(contactController.bulkImport)
);

/**
 * @route   GET /api/v1/contacts/export
 * @desc    Export contacts
 * @access  Private
 */
router.get(
  '/export',
  authenticate,
  requireScope('contacts:read'),
  [
    query('session_id').isUUID().withMessage('Valid session ID is required'),
  ],
  validationHandler,
  asyncHandler(contactController.exportContacts)
);

module.exports = router;

