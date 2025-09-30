/**
 * Rate Limiting Middleware
 * Implements rate limiting using Redis
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redisClient } = require('../config/redis');
const config = require('../config');
const { ApiError } = require('./errorHandler');

/**
 * Create rate limiter with Redis store
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
    handler: (req, res) => {
      throw new ApiError(429, 'Too many requests, please try again later');
    },
    keyGenerator: (req) => {
      // Use API key if present, otherwise use IP
      return req.apiKey?.id || req.user?.id || req.ip;
    },
  };

  return rateLimit({
    ...defaultOptions,
    ...options,
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    }),
  });
};

/**
 * Global rate limiter
 */
const global = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
});

/**
 * Authentication rate limiter (stricter)
 */
const auth = createRateLimiter({
  windowMs: 900000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  skipSuccessfulRequests: true,
});

/**
 * Message sending rate limiter
 */
const messages = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30, // 30 messages per minute
  keyGenerator: (req) => {
    // Rate limit per session
    return `session:${req.params.sessionId || req.body.sessionId}`;
  },
});

/**
 * API key creation rate limiter
 */
const apiKeyCreation = createRateLimiter({
  windowMs: 3600000, // 1 hour
  max: 10, // 10 API keys per hour
});

/**
 * Custom rate limiter based on API key settings
 */
const customApiKeyLimit = async (req, res, next) => {
  if (!req.apiKey || !req.apiKey.rate_limit) {
    return next();
  }

  const key = `custom_rl:${req.apiKey.id}`;
  const limit = req.apiKey.rate_limit;
  const windowMs = 60000; // 1 minute

  try {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
    }

    const ttl = await redisClient.ttl(key);
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));
    res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

    if (current > limit) {
      throw new ApiError(429, 'API key rate limit exceeded');
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // If Redis fails, allow the request
    next();
  }
};

module.exports = {
  global,
  auth,
  messages,
  apiKeyCreation,
  customApiKeyLimit,
  createRateLimiter,
};

