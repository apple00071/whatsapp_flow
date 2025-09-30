/**
 * Session Model
 * Represents WhatsApp session connections
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Session extends Model {
  /**
   * Check if session is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.status === 'connected';
  }

  /**
   * Check if session needs QR code
   * @returns {boolean} QR code requirement
   */
  needsQR() {
    return this.status === 'qr' || this.status === 'disconnected';
  }

  /**
   * Update session status
   * @param {string} status - New status
   */
  async updateStatus(status) {
    const updates = { status };
    
    if (status === 'connected') {
      updates.connected_at = new Date();
      updates.qr_code = null;
    } else if (status === 'disconnected') {
      updates.disconnected_at = new Date();
    }
    
    await this.update(updates);
  }
}

Session.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('initializing', 'qr', 'connected', 'disconnected', 'failed'),
      defaultValue: 'initializing',
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qr_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    connected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    disconnected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    webhook_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    webhook_events: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Events to send to webhook: message.received, message.status, etc.',
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Session-specific settings and metadata',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['phone_number'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

module.exports = Session;

