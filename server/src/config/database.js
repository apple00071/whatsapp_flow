/**
 * Database configuration for Sequelize ORM
 * Handles PostgreSQL connection and model synchronization
 */

const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Initialize Sequelize instance with configuration
 */
const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  pool: {
    min: config.database.pool.min,
    max: config.database.pool.max,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

/**
 * Test database connection
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

/**
 * Sync database models
 * @param {Object} options - Sequelize sync options
 */
async function syncDatabase(options = {}) {
  try {
    await sequelize.sync(options);
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeConnection() {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection,
};

