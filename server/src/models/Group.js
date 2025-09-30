/**
 * Group Model
 * Manages WhatsApp groups
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Group extends Model {}

Group.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sessions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    whatsapp_group_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'WhatsApp internal group ID',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_pic_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Phone number of group owner',
    },
    participants: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of participant objects with phone numbers and roles',
    },
    participant_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the session user is an admin',
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Group settings: announcements, edit info, etc.',
    },
    invite_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    indexes: [
      {
        unique: true,
        fields: ['session_id', 'whatsapp_group_id'],
      },
      {
        fields: ['session_id'],
      },
      {
        fields: ['whatsapp_group_id'],
      },
      {
        fields: ['name'],
      },
    ],
  }
);

module.exports = Group;

