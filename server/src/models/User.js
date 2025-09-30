/**
 * User Model
 * Represents platform users with authentication and authorization
 */

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const config = require('../config');

class User extends Model {
  /**
   * Compare password with hashed password
   * @param {string} password - Plain text password
   * @returns {Promise<boolean>} Match result
   */
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Check if account is locked
   * @returns {boolean} Lock status
   */
  isLocked() {
    return this.lock_until && this.lock_until > Date.now();
  }

  /**
   * Increment failed login attempts
   */
  async incrementLoginAttempts() {
    // Reset attempts if lock has expired
    if (this.lock_until && this.lock_until < Date.now()) {
      await this.update({
        login_attempts: 1,
        lock_until: null,
      });
      return;
    }

    const updates = { login_attempts: this.login_attempts + 1 };

    // Lock account if max attempts reached
    if (this.login_attempts + 1 >= config.security.maxLoginAttempts) {
      updates.lock_until = Date.now() + config.security.lockTime;
    }

    await this.update(updates);
  }

  /**
   * Reset login attempts
   */
  async resetLoginAttempts() {
    await this.update({
      login_attempts: 0,
      lock_until: null,
    });
  }

  /**
   * Get user's public profile (exclude sensitive data)
   * @returns {Object} Public profile
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.login_attempts;
    delete values.lock_until;
    delete values.reset_password_token;
    delete values.reset_password_expires;
    delete values.verification_token;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'developer'),
      defaultValue: 'user',
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lock_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    oauth_provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oauth_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['is_active'],
      },
    ],
    hooks: {
      /**
       * Hash password before creating user
       */
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(config.security.bcryptRounds);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      /**
       * Hash password before updating if changed
       */
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(config.security.bcryptRounds);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;

