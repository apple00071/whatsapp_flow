/**
 * Admin Controller
 * Handles admin operations and platform management
 */

const { User, Session, Message, ApiKey, Webhook } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Get platform statistics
 */
exports.getPlatformStats = async (req, res) => {
  const totalUsers = await User.count();
  const activeUsers = await User.count({
    where: {
      last_login_at: {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  const totalSessions = await Session.count();
  const activeSessions = await Session.count({ where: { status: 'connected' } });

  const totalMessages = await Message.count();
  const messagesToday = await Message.count({
    where: {
      created_at: {
        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const totalApiKeys = await ApiKey.count({ where: { is_active: true } });
  const totalWebhooks = await Webhook.count({ where: { is_active: true } });

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
      },
      messages: {
        total: totalMessages,
        today: messagesToday,
      },
      apiKeys: {
        total: totalApiKeys,
      },
      webhooks: {
        total: totalWebhooks,
      },
    },
  });
};

/**
 * List all users
 */
exports.listUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search;
  const role = req.query.role;

  const where = {};

  if (search) {
    where[Op.or] = [
      { email: { [Op.iLike]: `%${search}%` } },
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Session,
        as: 'sessions',
        attributes: ['id', 'status'],
      },
    ],
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    },
  });
};

/**
 * Get user details
 */
exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Session,
        as: 'sessions',
      },
      {
        model: ApiKey,
        as: 'apiKeys',
        attributes: { exclude: ['key_hash'] },
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get user statistics
  const sessionIds = user.sessions.map(s => s.id);
  const messageCount = await Message.count({
    where: { session_id: sessionIds },
  });

  res.json({
    success: true,
    data: {
      user,
      stats: {
        totalSessions: user.sessions.length,
        totalMessages: messageCount,
        totalApiKeys: user.apiKeys.length,
      },
    },
  });
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
  const { role, is_active, email_verified } = req.body;

  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updates = {};
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;
  if (email_verified !== undefined) updates.email_verified = email_verified;

  await user.update(updates);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent deleting own account
  if (user.id === req.user.id) {
    throw new ApiError(400, 'Cannot delete your own account');
  }

  // Delete all user's sessions
  const sessions = await Session.findAll({ where: { user_id: user.id } });
  for (const session of sessions) {
    const { whatsappManager } = require('../services/whatsapp.service');
    await whatsappManager.destroyClient(session.id);
  }

  await user.destroy();

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
};

/**
 * Reset user password
 */
exports.resetUserPassword = async (req, res) => {
  const { password } = req.body;

  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await user.update({ password: hashedPassword });

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
};

/**
 * List all sessions (admin view)
 */
exports.listAllSessions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status;

  const where = {};
  if (status) {
    where.status = status;
  }

  const { count, rows: sessions } = await Session.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name'],
      },
    ],
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
};

/**
 * Terminate session
 */
exports.terminateSession = async (req, res) => {
  const session = await Session.findByPk(req.params.id);

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Destroy WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  await whatsappManager.destroyClient(session.id);

  await session.update({ status: 'disconnected' });

  res.json({
    success: true,
    message: 'Session terminated successfully',
  });
};

/**
 * Get system health
 */
exports.getSystemHealth = async (req, res) => {
  const { redisClient } = require('../config/redis');
  const { sequelize } = require('../models');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Check database
  try {
    await sequelize.authenticate();
    health.services.database = { status: 'healthy' };
  } catch (error) {
    health.services.database = { status: 'unhealthy', error: error.message };
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    await redisClient.ping();
    health.services.redis = { status: 'healthy' };
  } catch (error) {
    health.services.redis = { status: 'unhealthy', error: error.message };
    health.status = 'unhealthy';
  }

  // Check WhatsApp manager
  const { whatsappManager } = require('../services/whatsapp.service');
  const activeClients = whatsappManager.clients.size;
  health.services.whatsapp = {
    status: 'healthy',
    activeClients,
  };

  res.json({
    success: true,
    data: health,
  });
};

/**
 * Get activity logs
 */
exports.getActivityLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  // TODO: Implement proper activity logging system
  // For now, return recent sessions and messages as activity

  const recentSessions = await Session.findAll({
    limit: limit / 2,
    offset: offset / 2,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['email'],
      },
    ],
  });

  const recentMessages = await Message.findAll({
    limit: limit / 2,
    offset: offset / 2,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: Session,
        as: 'session',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['email'],
          },
        ],
      },
    ],
  });

  const activities = [
    ...recentSessions.map(s => ({
      type: 'session',
      action: 'created',
      user: s.user.email,
      resource: s.name,
      timestamp: s.created_at,
    })),
    ...recentMessages.map(m => ({
      type: 'message',
      action: 'sent',
      user: m.session?.user?.email,
      resource: m.type,
      timestamp: m.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    success: true,
    data: {
      activities: activities.slice(0, limit),
      pagination: {
        page,
        limit,
        total: activities.length,
        totalPages: Math.ceil(activities.length / limit),
      },
    },
  });
};

