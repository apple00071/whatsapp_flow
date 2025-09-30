/**
 * API Key Model
 * Manages API keys for external application authentication
 */

const { DataTypes, Model } = require('sequelize');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

class ApiKey extends Model {
  /**
   * Generate a new API key
   * @returns {string} Generated API key
   */
  static generateKey() {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Hash API key for storage
   * @param {string} key - Plain API key
   * @returns {string} Hashed key
   */
  static hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Verify API key
   * @param {string} key - Plain API key
   * @returns {boolean} Verification result
   */
  verifyKey(key) {
    const hashedKey = ApiKey.hashKey(key);
    return this.key_hash === hashedKey;
  }

  /**
   * Check if API key is active and not expired
   * @returns {boolean} Active status
   */
  isActive() {
    if (!this.is_active) return false;
    if (this.expires_at && this.expires_at < new Date()) return false;
    return true;
  }

  /**
   * Increment usage count
   */
  async incrementUsage() {
    await this.increment('usage_count');
    await this.update({ last_used_at: new Date() });
  }
}

ApiKey.init(
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
    key_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    key_prefix: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rate_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Custom rate limit for this API key (requests per minute)',
    },
    allowed_ips: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Whitelist of IP addresses allowed to use this key',
    },
    scopes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['messages:read', 'messages:write', 'sessions:read', 'sessions:write'],
      comment: 'Permissions granted to this API key',
    },
  },
  {
    sequelize,
    modelName: 'ApiKey',
    tableName: 'api_keys',
    indexes: [
      {
        unique: true,
        fields: ['key_hash'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

module.exports = ApiKey;

