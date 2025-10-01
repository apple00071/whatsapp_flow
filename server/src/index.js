/**
 * Server Entry Point
 * Initializes database, starts HTTP and WebSocket servers
 */

// Add console logging for early errors
console.log('Starting WhatsApp API Platform server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { testConnection: testDbConnection, syncDatabase } = require('./config/database');
const { testConnection: testRedisConnection } = require('./config/redis');
const { initializeWebSocket } = require('./websocket');
const { initializeWhatsAppManager } = require('./services/whatsapp.service');

console.log('All modules loaded successfully');

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Initialize WebSocket server
 */
initializeWebSocket(server);

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connection
      const { closeConnection: closeDbConnection } = require('./config/database');
      await closeDbConnection();
      
      // Close Redis connection
      const { closeConnection: closeRedisConnection } = require('./config/redis');
      await closeRedisConnection();
      
      logger.info('All connections closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

/**
 * Process event handlers
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Start server
 */
async function startServer() {
  try {
    console.log('Entering startServer function...');
    logger.info('Starting WhatsApp API Platform...');

    // Test database connection
    console.log('Testing database connection...');
    logger.info('Testing database connection...');
    await testDbConnection();
    console.log('Database connection successful');

    // Sync database models
    console.log('Synchronizing database models...');
    logger.info('Synchronizing database models...');
    await syncDatabase({ alter: config.env === 'development' });
    console.log('Database sync successful');

    // Test Redis connection
    console.log('Testing Redis connection...');
    logger.info('Testing Redis connection...');
    await testRedisConnection();
    console.log('Redis connection successful');

    // Initialize WhatsApp manager
    console.log('Initializing WhatsApp manager...');
    logger.info('Initializing WhatsApp manager...');
    await initializeWhatsAppManager();
    console.log('WhatsApp manager initialized');

    // Start HTTP server
    console.log(`Starting HTTP server on port ${config.port}...`);
    server.listen(config.port, '0.0.0.0', () => {
      console.log(`Server is listening on port ${config.port}`);
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   WhatsApp Programmable Messaging Platform                ║
║                                                           ║
║   Environment: ${config.env.padEnd(43)}║
║   Server:      http://0.0.0.0:${config.port.toString().padEnd(30)}║
║   API Docs:    http://0.0.0.0:${config.port}/api/docs${' '.repeat(17)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);

      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Version: ${config.apiVersion}`);
    });

  } catch (error) {
    console.error('FATAL ERROR in startServer:', error);
    console.error('Error stack:', error.stack);
    logger.error('Failed to start server:', error);
    logger.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Start the server
console.log('Calling startServer...');
startServer().catch(error => {
  console.error('Unhandled error in startServer:', error);
  process.exit(1);
});

module.exports = server;

