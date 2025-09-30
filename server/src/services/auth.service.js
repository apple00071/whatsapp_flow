/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const config = require('../config');
const { ApiError } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');
const emailService = require('./email.service');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async register(userData) {
    const { email, password, first_name, last_name } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      verification_token: verificationToken,
      is_verified: !config.features.enableEmailVerification,
    });

    // Send verification email if enabled
    if (config.features.enableEmailVerification) {
      await emailService.sendVerificationEmail(user.email, verificationToken);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and tokens
   */
  async login(email, password) {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new ApiError(423, 'Account is temporarily locked due to multiple failed login attempts');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new ApiError(403, 'Account is deactivated');
    }

    // Check if email is verified
    if (config.features.enableEmailVerification && !user.is_verified) {
      throw new ApiError(403, 'Please verify your email address');
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Cache user
    await cache.set(`user:${user.id}`, user, 300);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Logout user
   * @param {string} token - JWT token to blacklist
   */
  async logout(token) {
    // Blacklist token
    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await cache.set(`blacklist:${token}`, true, expiresIn);
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      // Get user
      const user = await User.findByPk(decoded.id);
      if (!user || !user.is_active) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Verify email
   * @param {string} token - Verification token
   */
  async verifyEmail(token) {
    const user = await User.findOne({ where: { verification_token: token } });
    
    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    await user.update({
      is_verified: true,
      verification_token: null,
    });

    return user;
  }

  /**
   * Request password reset
   * @param {string} email - User email
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpires,
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   */
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        reset_password_token: token,
      },
    });

    if (!user || !user.reset_password_expires || user.reset_password_expires < new Date()) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    await user.update({
      password: newPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    return user;
  }

  /**
   * Generate JWT tokens
   * @param {Object} user - User object
   * @returns {Object} Access and refresh tokens
   */
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    await user.update({ password: newPassword });

    return user;
  }
}

module.exports = new AuthService();

