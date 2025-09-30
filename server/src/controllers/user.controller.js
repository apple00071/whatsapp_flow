/**
 * User Controller
 * Handles user profile management operations
 */

const { User, Session, ApiKey } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Session,
        as: 'sessions',
        attributes: ['id', 'name', 'status', 'phone_number', 'created_at'],
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get user statistics
  const stats = {
    totalSessions: await Session.count({ where: { user_id: req.user.id } }),
    activeSessions: await Session.count({ 
      where: { user_id: req.user.id, status: 'connected' } 
    }),
    totalApiKeys: await ApiKey.count({ 
      where: { user_id: req.user.id, is_active: true } 
    }),
  };

  res.json({
    success: true,
    data: {
      user,
      stats,
    },
  });
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  const { first_name, last_name, phone, company, timezone } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (company !== undefined) updates.company = company;
  if (timezone !== undefined) updates.timezone = timezone;

  await user.update(updates);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
};

/**
 * Update user email
 */
exports.updateEmail = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }

  // Check if email is already taken
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser && existingUser.id !== user.id) {
    throw new ApiError(400, 'Email already in use');
  }

  // Update email and mark as unverified
  await user.update({
    email,
    email_verified: false,
  });

  // TODO: Send verification email

  res.json({
    success: true,
    message: 'Email updated successfully. Please verify your new email.',
    data: user,
  });
};

/**
 * Delete user account
 */
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }

  // Delete all user's sessions
  const sessions = await Session.findAll({ where: { user_id: user.id } });
  for (const session of sessions) {
    // Destroy WhatsApp clients
    const { whatsappManager } = require('../services/whatsapp.service');
    await whatsappManager.destroyClient(session.id);
  }

  // Delete user (cascade will delete sessions, api keys, etc.)
  await user.destroy();

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
};

/**
 * Get user preferences
 */
exports.getPreferences = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      preferences: user.preferences || {},
    },
  });
};

/**
 * Update user preferences
 */
exports.updatePreferences = async (req, res) => {
  const { preferences } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Merge with existing preferences
  const updatedPreferences = {
    ...user.preferences,
    ...preferences,
  };

  await user.update({ preferences: updatedPreferences });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: updatedPreferences,
    },
  });
};

/**
 * Get user activity log
 */
exports.getActivityLog = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // TODO: Implement activity logging system
  // For now, return sessions and API keys as activity

  const sessions = await Session.findAll({
    where: { user_id: req.user.id },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'name', 'status', 'created_at', 'updated_at'],
  });

  const total = await Session.count({ where: { user_id: req.user.id } });

  res.json({
    success: true,
    data: {
      activities: sessions.map(s => ({
        type: 'session',
        action: 'created',
        resource: s.name,
        timestamp: s.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * Get user usage statistics
 */
exports.getUsageStats = async (req, res) => {
  const { Message } = require('../models');
  const { Op } = require('sequelize');

  // Get date range (default: last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Get user's sessions
  const sessions = await Session.findAll({
    where: { user_id: req.user.id },
    attributes: ['id'],
  });

  const sessionIds = sessions.map(s => s.id);

  // Get message statistics
  const totalMessages = await Message.count({
    where: {
      session_id: sessionIds,
      created_at: { [Op.between]: [startDate, endDate] },
    },
  });

  const sentMessages = await Message.count({
    where: {
      session_id: sessionIds,
      direction: 'outbound',
      created_at: { [Op.between]: [startDate, endDate] },
    },
  });

  const receivedMessages = await Message.count({
    where: {
      session_id: sessionIds,
      direction: 'inbound',
      created_at: { [Op.between]: [startDate, endDate] },
    },
  });

  // Get messages by type
  const messagesByType = await Message.findAll({
    where: {
      session_id: sessionIds,
      created_at: { [Op.between]: [startDate, endDate] },
    },
    attributes: [
      'type',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
    ],
    group: ['type'],
    raw: true,
  });

  res.json({
    success: true,
    data: {
      period: {
        start: startDate,
        end: endDate,
      },
      messages: {
        total: totalMessages,
        sent: sentMessages,
        received: receivedMessages,
        byType: messagesByType,
      },
      sessions: {
        total: sessions.length,
        active: await Session.count({
          where: { user_id: req.user.id, status: 'connected' },
        }),
      },
    },
  });
};

