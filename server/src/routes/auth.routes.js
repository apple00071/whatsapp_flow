/**
 * Authentication Routes
 * Handles user registration, login, and password management
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { asyncHandler, validationHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const authService = require('../services/auth.service');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  rateLimiter.auth,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().optional(),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    });
  })
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  rateLimiter.auth,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    });
  })
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (blacklist token)
 * @access  Private
 */
router.post(
  '/logout',
  verifyToken,
  asyncHandler(async (req, res) => {
    await authService.logout(req.token);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  })
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  })
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  rateLimiter.auth,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'Password reset email sent if account exists',
    });
  })
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  })
);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.put(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  validationHandler,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

module.exports = router;

