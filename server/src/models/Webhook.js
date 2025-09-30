/**
 * Webhook Model
 * Manages webhook configurations and delivery logs
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Webhook extends Model {
  /**
   * Check if webhook is active
   * @returns {boolean} Active status
   */
  isActive() {
    return this.is_active && (!this.disabled_until || this.disabled_until < new Date());
  }

  /**
   * Temporarily disable webhook (after repeated failures)
   * @param {number} duration - Duration in milliseconds
   */
  async temporarilyDisable(duration = 3600000) {
    await this.update({
      disabled_until: new Date(Date.now() + duration),
      failure_count: this.failure_count + 1,
    });
  }

  /**
   * Reset failure count on successful delivery
   */
  async resetFailures() {
    await this.update({
      failure_count: 0,
      disabled_until: null,
      last_success_at: new Date(),
    });
  }
}

Webhook.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sessions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Optional: webhook for specific session only',
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    events: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Events to trigger webhook: message.received, message.status, session.connected, etc.',
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Secret for HMAC signature verification',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    disabled_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Temporarily disable webhook until this time',
    },
    failure_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_success_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_failure_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headers: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Custom headers to send with webhook requests',
    },
  },
  {
    sequelize,
    modelName: 'Webhook',
    tableName: 'webhooks',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['session_id'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

module.exports = Webhook;

