/**
 * Contact Model
 * Manages WhatsApp contacts for each session
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Contact extends Model {}

Contact.init(
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    push_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name set by the contact in WhatsApp',
    },
    profile_pic_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_business: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_enterprise: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    labels: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Custom labels/tags for organizing contacts',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    custom_fields: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Custom fields for additional contact information',
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    indexes: [
      {
        unique: true,
        fields: ['session_id', 'phone_number'],
      },
      {
        fields: ['session_id'],
      },
      {
        fields: ['phone_number'],
      },
      {
        fields: ['name'],
      },
    ],
  }
);

module.exports = Contact;

