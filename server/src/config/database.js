/**
 * Database configuration for Sequelize ORM
 * Handles Supabase PostgreSQL connection and model synchronization
 */

const { Sequelize } = require('sequelize');
const dns = require('dns');
const net = require('net');
const pg = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

// AGGRESSIVE IPv4-ONLY CONFIGURATION
// Force IPv4 DNS resolution to avoid ENETUNREACH errors
// Render.com may not support IPv6 connectivity to Supabase
dns.setDefaultResultOrder('ipv4first');

// Override DNS lookup to return only IPv4 addresses
const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  // Force IPv4 family
  options.family = 4;

  logger.info(`DNS lookup for ${hostname} - forcing IPv4 only`);
  return originalLookup.call(this, hostname, options, callback);
};

/**
 * Custom connection function that forces IPv4
 * This overrides pg's default connection behavior
 */
const originalConnect = net.Socket.prototype.connect;
let ipv4Forced = false;

function forceIPv4Connection() {
  if (ipv4Forced) return;

  net.Socket.prototype.connect = function(...args) {
    const options = args[0];
    if (typeof options === 'object' && options !== null) {
      // Force IPv4 family
      options.family = 4;
      logger.info('Forcing IPv4 connection for database');
    }
    return originalConnect.apply(this, args);
  };

  ipv4Forced = true;
  logger.info('IPv4 connection enforced at socket level');
}

/**
 * Parse DATABASE_URL and create Sequelize configuration
 * This ensures proper handling of special characters in password
 */
let sequelizeConfig;

// Force IPv4 at socket level BEFORE creating any connections
forceIPv4Connection();

if (config.database.url) {
  try {
    const dbUrl = new URL(config.database.url);

    // Extract connection details from URL
    const host = dbUrl.hostname;
    // Use Supabase connection pooler (6543) instead of direct connection (5432)
    // The pooler may have better IPv4 support
    const port = dbUrl.port === '5432' ? 6543 : (dbUrl.port || 6543);
    const database = dbUrl.pathname.slice(1); // Remove leading '/'
    const username = dbUrl.username;
    const password = decodeURIComponent(dbUrl.password); // Decode URL-encoded password

    logger.info(`Connecting to database: ${host}:${port}/${database} (using connection pooler)`);

    sequelizeConfig = {
      host,
      port,
      database,
      username,
      password,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Supabase
        },
        // Connection timeout settings
        connectTimeout: 60000, // 60 seconds
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      },
      logging: config.database.logging ? (msg) => logger.debug(msg) : false,
      pool: {
        min: config.database.pool.min,
        max: config.database.pool.max,
        acquire: 60000, // Increased timeout for slow connections
        idle: 10000,
      },
      // Retry configuration for network errors
      retry: {
        max: 3,
        match: [
          /ENETUNREACH/,
          /ETIMEDOUT/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /SequelizeConnectionError/,
        ],
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    };
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  // Fallback to individual environment variables
  sequelizeConfig = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
    pool: {
      min: config.database.pool.min,
      max: config.database.pool.max,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  };
}

/**
 * Initialize Sequelize instance with Supabase configuration
 */
const sequelize = new Sequelize(sequelizeConfig);

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

