/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const messageRoutes = require('./routes/message.routes');
const contactRoutes = require('./routes/contact.routes');
const groupRoutes = require('./routes/group.routes');
const webhookRoutes = require('./routes/webhook.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');
const adminRoutes = require('./routes/admin.routes');
const healthRoutes = require('./routes/health.routes');

// AI_INTEGRATION_POINT: Import AI routes when implemented
// const aiRoutes = require('./routes/ai.routes');

/**
 * Create Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

/**
 * CORS configuration
 */
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Compression middleware
 */
app.use(compression());

/**
 * Logging middleware
 */
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

/**
 * Request ID middleware
 */
app.use((req, res, next) => {
  req.id = require('uuid').v4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

/**
 * Rate limiting (global)
 */
app.use('/api', rateLimiter.global);

/**
 * API Routes
 */
const apiRouter = express.Router();

// Public routes (no authentication required)
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);

// Protected routes (authentication required)
apiRouter.use('/users', userRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/contacts', contactRoutes);
apiRouter.use('/groups', groupRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use('/api-keys', apiKeyRoutes);
apiRouter.use('/admin', adminRoutes);

// AI_INTEGRATION_POINT: Add AI routes when implemented
// apiRouter.use('/ai', aiRoutes);

app.use(`/api/${config.apiVersion}`, apiRouter);

/**
 * API Documentation (Swagger)
 */
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WhatsApp API Documentation',
}));

/**
 * Serve uploaded media files
 */
if (config.media.storageType === 'local') {
  app.use('/uploads', express.static(config.media.uploadPath));
}

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp Programmable Messaging Platform',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    health: '/api/v1/health',
  });
});

/**
 * 404 handler
 */
app.use(notFoundHandler);

/**
 * Error handler (must be last)
 */
app.use(errorHandler);

module.exports = app;

