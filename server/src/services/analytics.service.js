/**
 * Analytics Service
 * Handles usage statistics and analytics
 */

const { User, Session, Message, ApiKey, Webhook } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Get user analytics
   */
  async getUserAnalytics(userId, startDate, endDate) {
    // Get user's sessions
    const sessions = await Session.findAll({
      where: { user_id: userId },
      attributes: ['id'],
    });

    const sessionIds = sessions.map(s => s.id);

    // Get message statistics
    const messageStats = await this.getMessageStats(sessionIds, startDate, endDate);

    // Get session statistics
    const sessionStats = await this.getSessionStats(userId);

    // Get API key statistics
    const apiKeyStats = await this.getApiKeyStats(userId);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      messages: messageStats,
      sessions: sessionStats,
      apiKeys: apiKeyStats,
    };
  }

  /**
   * Get message statistics
   */
  async getMessageStats(sessionIds, startDate, endDate) {
    const where = {
      session_id: sessionIds,
    };

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Total messages
    const total = await Message.count({ where });

    // Messages by direction
    const sent = await Message.count({
      where: { ...where, direction: 'outbound' },
    });

    const received = await Message.count({
      where: { ...where, direction: 'inbound' },
    });

    // Messages by type
    const byType = await Message.findAll({
      where,
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    // Messages by status
    const byStatus = await Message.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Messages over time (daily)
    const overTime = await Message.findAll({
      where,
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: [require('sequelize').fn('DATE', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'ASC']],
      raw: true,
    });

    return {
      total,
      sent,
      received,
      byType,
      byStatus,
      overTime,
    };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(userId) {
    const total = await Session.count({
      where: { user_id: userId },
    });

    const active = await Session.count({
      where: { user_id: userId, status: 'connected' },
    });

    const byStatus = await Session.findAll({
      where: { user_id: userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    return {
      total,
      active,
      byStatus,
    };
  }

  /**
   * Get API key statistics
   */
  async getApiKeyStats(userId) {
    const total = await ApiKey.count({
      where: { user_id: userId },
    });

    const active = await ApiKey.count({
      where: { user_id: userId, is_active: true },
    });

    return {
      total,
      active,
    };
  }

  /**
   * Get platform-wide analytics (admin only)
   */
  async getPlatformAnalytics(startDate, endDate) {
    // User statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: {
        last_login_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const newUsers = await User.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Session statistics
    const totalSessions = await Session.count();
    const activeSessions = await Session.count({
      where: { status: 'connected' },
    });

    const newSessions = await Session.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Message statistics
    const totalMessages = await Message.count();
    const messagesInPeriod = await Message.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Messages by type
    const messagesByType = await Message.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    // API key statistics
    const totalApiKeys = await ApiKey.count();
    const activeApiKeys = await ApiKey.count({
      where: { is_active: true },
    });

    // Webhook statistics
    const totalWebhooks = await Webhook.count();
    const activeWebhooks = await Webhook.count({
      where: { is_active: true },
    });

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
        new: newSessions,
      },
      messages: {
        total: totalMessages,
        inPeriod: messagesInPeriod,
        byType: messagesByType,
      },
      apiKeys: {
        total: totalApiKeys,
        active: activeApiKeys,
      },
      webhooks: {
        total: totalWebhooks,
        active: activeWebhooks,
      },
    };
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId, startDate, endDate) {
    const session = await Session.findByPk(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    // Get message statistics for this session
    const messageStats = await this.getMessageStats([sessionId], startDate, endDate);

    // Get contact count
    const { Contact } = require('../models');
    const contactCount = await Contact.count({
      where: { session_id: sessionId },
    });

    // Get group count
    const { Group } = require('../models');
    const groupCount = await Group.count({
      where: { session_id: sessionId },
    });

    return {
      session: {
        id: session.id,
        name: session.name,
        status: session.status,
        phone_number: session.phone_number,
        created_at: session.created_at,
      },
      period: {
        start: startDate,
        end: endDate,
      },
      messages: messageStats,
      contacts: contactCount,
      groups: groupCount,
    };
  }

  /**
   * Get top users by message count
   */
  async getTopUsers(limit = 10, startDate, endDate) {
    const where = {};

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    const topUsers = await Message.findAll({
      where,
      attributes: [
        [require('sequelize').col('session.user_id'), 'user_id'],
        [require('sequelize').fn('COUNT', require('sequelize').col('Message.id')), 'message_count'],
      ],
      include: [
        {
          model: Session,
          as: 'session',
          attributes: [],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'first_name', 'last_name'],
            },
          ],
        },
      ],
      group: ['session.user_id', 'session->user.id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('Message.id')), 'DESC']],
      limit,
      raw: false,
    });

    return topUsers;
  }

  /**
   * Get growth metrics
   */
  async getGrowthMetrics(days = 30) {
    const metrics = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const newUsers = await User.count({
        where: {
          created_at: {
            [Op.between]: [date, nextDate],
          },
        },
      });

      const newSessions = await Session.count({
        where: {
          created_at: {
            [Op.between]: [date, nextDate],
          },
        },
      });

      const messages = await Message.count({
        where: {
          created_at: {
            [Op.between]: [date, nextDate],
          },
        },
      });

      metrics.push({
        date: date.toISOString().split('T')[0],
        newUsers,
        newSessions,
        messages,
      });
    }

    return metrics;
  }
}

module.exports = new AnalyticsService();

