/**
 * Server Entry Point
 * Initializes database, starts HTTP and WebSocket servers
 */

const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { testConnection: testDbConnection, syncDatabase } = require('./config/database');
const { testConnection: testRedisConnection } = require('./config/redis');
const { initializeWebSocket } = require('./websocket');
const { initializeWhatsAppManager } = require('./services/whatsapp.service');

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
    logger.info('Starting WhatsApp API Platform...');
    
    // Test database connection
    logger.info('Testing database connection...');
    await testDbConnection();
    
    // Sync database models
    logger.info('Synchronizing database models...');
    await syncDatabase({ alter: config.env === 'development' });
    
    // Test Redis connection
    logger.info('Testing Redis connection...');
    await testRedisConnection();
    
    // Initialize WhatsApp manager
    logger.info('Initializing WhatsApp manager...');
    await initializeWhatsAppManager();
    
    // Start HTTP server
    server.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   WhatsApp Programmable Messaging Platform                ║
║                                                           ║
║   Environment: ${config.env.padEnd(43)}║
║   Server:      http://localhost:${config.port.toString().padEnd(28)}║
║   API Docs:    http://localhost:${config.port}/api/docs${' '.repeat(15)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
      
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Version: ${config.apiVersion}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = server;

