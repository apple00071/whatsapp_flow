/**
 * Models Index
 * Imports all models and defines associations
 */

const User = require('./User');
const ApiKey = require('./ApiKey');
const Session = require('./Session');
const Message = require('./Message');
const Contact = require('./Contact');
const Group = require('./Group');
const Webhook = require('./Webhook');

/**
 * Define model associations
 */

// User associations
User.hasMany(ApiKey, {
  foreignKey: 'user_id',
  as: 'apiKeys',
  onDelete: 'CASCADE',
});

User.hasMany(Session, {
  foreignKey: 'user_id',
  as: 'sessions',
  onDelete: 'CASCADE',
});

User.hasMany(Webhook, {
  foreignKey: 'user_id',
  as: 'webhooks',
  onDelete: 'CASCADE',
});

// ApiKey associations
ApiKey.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Session associations
Session.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Session.hasMany(Message, {
  foreignKey: 'session_id',
  as: 'messages',
  onDelete: 'CASCADE',
});

Session.hasMany(Contact, {
  foreignKey: 'session_id',
  as: 'contacts',
  onDelete: 'CASCADE',
});

Session.hasMany(Group, {
  foreignKey: 'session_id',
  as: 'groups',
  onDelete: 'CASCADE',
});

Session.hasMany(Webhook, {
  foreignKey: 'session_id',
  as: 'webhooks',
  onDelete: 'CASCADE',
});

// Message associations
Message.belongsTo(Session, {
  foreignKey: 'session_id',
  as: 'session',
});

// Contact associations
Contact.belongsTo(Session, {
  foreignKey: 'session_id',
  as: 'session',
});

// Group associations
Group.belongsTo(Session, {
  foreignKey: 'session_id',
  as: 'session',
});

// Webhook associations
Webhook.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Webhook.belongsTo(Session, {
  foreignKey: 'session_id',
  as: 'session',
});

module.exports = {
  User,
  ApiKey,
  Session,
  Message,
  Contact,
  Group,
  Webhook,
};

