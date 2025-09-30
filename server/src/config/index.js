/**
 * Central configuration file for the WhatsApp API Platform
 * Loads and validates all environment variables
 */

require('dotenv').config();

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'whatsapp_api',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    },
    logging: process.env.NODE_ENV === 'development',
  },
  
  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },
  
  // WhatsApp Configuration
  whatsapp: {
    sessionPath: process.env.WHATSAPP_SESSION_PATH || './sessions',
    maxSessions: parseInt(process.env.WHATSAPP_MAX_SESSIONS, 10) || 10,
    timeout: parseInt(process.env.WHATSAPP_TIMEOUT, 10) || 60000,
    retryAttempts: parseInt(process.env.WHATSAPP_RETRY_ATTEMPTS, 10) || 3,
  },
  
  // Media Storage Configuration
  media: {
    storageType: process.env.MEDIA_STORAGE_TYPE || 'local',
    uploadPath: process.env.MEDIA_UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MEDIA_MAX_SIZE, 10) || 52428800, // 50MB
    allowedTypes: process.env.MEDIA_ALLOWED_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'application/pdf',
    ],
  },
  
  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1',
    s3ACL: process.env.AWS_S3_ACL || 'public-read',
  },
  
  // Google Cloud Storage Configuration
  gcs: {
    projectId: process.env.GCS_PROJECT_ID,
    bucket: process.env.GCS_BUCKET,
    keyFile: process.env.GCS_KEYFILE,
  },
  
  // Azure Blob Storage Configuration
  azure: {
    storageAccount: process.env.AZURE_STORAGE_ACCOUNT,
    storageKey: process.env.AZURE_STORAGE_KEY,
    container: process.env.AZURE_STORAGE_CONTAINER,
  },
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
  },
  
  // Webhook Configuration
  webhook: {
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS, 10) || 3,
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY, 10) || 1000,
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT, 10) || 10000,
    secret: process.env.WEBHOOK_SECRET || 'webhook-secret',
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  
  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@yourplatform.com',
    fromName: process.env.EMAIL_FROM_NAME || 'WhatsApp API Platform',
  },
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000,
  },
  
  // Queue Configuration
  queue: {
    redisUrl: process.env.QUEUE_REDIS_URL || process.env.REDIS_URL,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY, 10) || 5,
  },
  
  // Monitoring Configuration
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9090,
  },
  
  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockTime: parseInt(process.env.LOCK_TIME, 10) || 900000,
  },
  
  // AI Integration Configuration (Placeholder for future use)
  // AI_INTEGRATION_POINT: These settings will be used when AI features are implemented
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000',
    apiKey: process.env.AI_API_KEY,
    enableAutoReply: process.env.AI_ENABLE_AUTO_REPLY === 'true',
    enableSentimentAnalysis: process.env.AI_ENABLE_SENTIMENT_ANALYSIS === 'true',
    enableSpamDetection: process.env.AI_ENABLE_SPAM_DETECTION === 'true',
  },
  
  // Feature Flags
  features: {
    enableWebhooks: process.env.ENABLE_WEBHOOKS !== 'false',
    enableOAuth: process.env.ENABLE_OAUTH === 'true',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    enableTwoFactorAuth: process.env.ENABLE_TWO_FACTOR_AUTH === 'true',
  },
  
  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@yourplatform.com',
    password: process.env.ADMIN_PASSWORD || 'change-this-password',
  },
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const required = [
    'jwt.secret',
    'database.url',
  ];
  
  const missing = [];
  
  required.forEach((key) => {
    const keys = key.split('.');
    let value = config;
    
    keys.forEach((k) => {
      value = value?.[k];
    });
    
    if (!value) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  // Warn about default values in production
  if (config.env === 'production') {
    if (config.jwt.secret === 'your-secret-key-change-in-production') {
      console.warn('WARNING: Using default JWT secret in production!');
    }
    if (config.admin.password === 'change-this-password') {
      console.warn('WARNING: Using default admin password in production!');
    }
  }
}

// Validate configuration on load
validateConfig();

module.exports = config;

