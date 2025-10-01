/**
 * Safe Server Entry Point with Detailed Error Logging
 * This version catches ALL errors including module loading errors
 */

// Catch ALL uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

console.log('='.repeat(60));
console.log('🚀 Starting WhatsApp API Platform Server');
console.log('='.repeat(60));
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || '3000');
console.log('='.repeat(60));

// Load modules one by one with error handling
let http, app, config, logger, database, redis, websocket, whatsappService;

try {
  console.log('📦 Loading http module...');
  http = require('http');
  console.log('✅ http loaded');
} catch (error) {
  console.error('❌ Failed to load http:', error.message);
  process.exit(1);
}

try {
  console.log('📦 Loading app module...');
  app = require('./app');
  console.log('✅ app loaded');
} catch (error) {
  console.error('❌ Failed to load app:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('📦 Loading config module...');
  config = require('./config');
  console.log('✅ config loaded');
  console.log('Config port:', config.port);
  console.log('Config env:', config.env);
} catch (error) {
  console.error('❌ Failed to load config:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('📦 Loading logger module...');
  logger = require('./utils/logger');
  console.log('✅ logger loaded');
} catch (error) {
  console.error('❌ Failed to load logger:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('📦 Loading database module...');
  database = require('./config/database');
  console.log('✅ database loaded');
} catch (error) {
  console.error('❌ Failed to load database:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('📦 Loading redis module...');
  redis = require('./config/redis');
  console.log('✅ redis loaded');
} catch (error) {
  console.error('❌ Failed to load redis:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('📦 Loading websocket module...');
  websocket = require('./websocket');
  console.log('✅ websocket loaded');
} catch (error) {
  console.error('❌ Failed to load websocket:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

try {
  console.log('📦 Loading whatsapp service module...');
  whatsappService = require('./services/whatsapp.service');
  console.log('✅ whatsapp service loaded');
} catch (error) {
  console.error('❌ Failed to load whatsapp service:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('='.repeat(60));
console.log('✅ All modules loaded successfully!');
console.log('='.repeat(60));

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Initialize WebSocket server
 */
try {
  console.log('🔌 Initializing WebSocket...');
  websocket.initializeWebSocket(server);
  console.log('✅ WebSocket initialized');
} catch (error) {
  console.error('❌ Failed to initialize WebSocket:', error.message);
  console.error('Stack:', error.stack);
  // Continue anyway - WebSocket is not critical for startup
}

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received, starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('🛑 HTTP server closed');
    
    try {
      if (database.closeConnection) {
        await database.closeConnection();
        console.log('✅ Database connection closed');
      }
      
      if (redis.closeConnection) {
        await redis.closeConnection();
        console.log('✅ Redis connection closed');
      }
      
      console.log('✅ All connections closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start server
 */
async function startServer() {
  try {
    console.log('='.repeat(60));
    console.log('🚀 Starting server initialization...');
    console.log('='.repeat(60));

    // Start HTTP server FIRST to satisfy Render's port binding requirement
    const port = config.port || process.env.PORT || 10000;
    const host = '0.0.0.0';

    console.log('='.repeat(60));
    console.log(`🌐 Starting HTTP server on ${host}:${port}...`);
    console.log('='.repeat(60));

    server.listen(port, host, () => {
      console.log('='.repeat(60));
      console.log('✅ SERVER IS RUNNING!');
      console.log('='.repeat(60));
      console.log(`🌍 Host: ${host}`);
      console.log(`🔌 Port: ${port}`);
      console.log(`🌐 Environment: ${config.env}`);
      console.log(`📚 API Version: ${config.apiVersion}`);
      console.log(`📖 API Docs: http://${host}:${port}/api/v1/docs`);
      console.log(`❤️  Health: http://${host}:${port}/api/v1/health`);
      console.log('='.repeat(60));

      logger.info('Server started successfully');
      logger.info(`Listening on ${host}:${port}`);

      // Test connections AFTER server is running
      testConnectionsAsync();
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ FATAL ERROR during server startup');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(60));

    if (logger && logger.error) {
      logger.error('Failed to start server:', error);
    }

    process.exit(1);
  }
}

// Test connections asynchronously after server starts
async function testConnectionsAsync() {
  console.log('='.repeat(60));
  console.log('🔧 Testing connections asynchronously...');
  console.log('='.repeat(60));

  // Test database connection with timeout
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database URL:', config.database.url ? 'Set (hidden)' : 'NOT SET');
    await Promise.race([
      database.testConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout after 60 seconds')), 60000))
    ]);
    console.log('✅ Database connection successful');

    // Sync database models only if connection successful
    try {
      console.log('🔄 Synchronizing database models...');
      await database.syncDatabase({ alter: config.env === 'development' });
      console.log('✅ Database synchronized');
    } catch (syncError) {
      console.error('⚠️  Database sync failed:', syncError.message);
    }
  } catch (error) {
    console.error('⚠️  Database connection failed:', error.message);
    console.error('🔄 Server will continue running, but database features may not work');
  }

  // Test Redis connection with timeout
  try {
    console.log('🔍 Testing Redis connection...');
    console.log('Redis URL:', config.redis.url ? 'Set (hidden)' : 'NOT SET');
    await Promise.race([
      redis.testConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout after 10 seconds')), 10000))
    ]);
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.error('⚠️  Redis connection failed:', error.message);
    console.error('🔄 Server will continue running with in-memory rate limiting');
  }

  // Initialize rate limit Redis client
  try {
    console.log('🔍 Initializing rate limit Redis client...');
    const rateLimiter = require('./middleware/rateLimiter');
    await rateLimiter.initRateLimitClient();
    console.log('✅ Rate limit Redis client initialized');
  } catch (error) {
    console.error('⚠️  Rate limit Redis client failed:', error.message);
    console.error('🔄 Using in-memory rate limiting');
  }

  // Initialize WhatsApp manager
  try {
    console.log('📱 Initializing WhatsApp manager...');
    await whatsappService.initializeWhatsAppManager();
    console.log('✅ WhatsApp manager initialized');
  } catch (error) {
    console.error('⚠️  WhatsApp manager failed:', error.message);
    console.error('🔄 WhatsApp features may not work properly');
  }

  console.log('='.repeat(60));
  console.log('🎉 SERVER INITIALIZATION COMPLETE!');
  console.log('='.repeat(60));
}

// Start the server
console.log('🎬 Calling startServer()...');
startServer().catch(error => {
  console.error('❌ Unhandled error in startServer:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

module.exports = server;

