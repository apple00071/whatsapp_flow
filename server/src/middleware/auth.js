/**
 * Authentication Middleware
 * Handles JWT and API key authentication
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError, asyncHandler } = require('./errorHandler');
const { User, ApiKey } = require('../models');
const { cache } = require('../config/redis');

/**
 * Verify JWT token
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided');
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if token is blacklisted (for logout)
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new ApiError(401, 'Token has been revoked');
    }
    
    // Get user from cache or database
    let user = await cache.get(`user:${decoded.id}`);
    
    if (!user) {
      user = await User.findByPk(decoded.id);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }
      
      // Cache user for 5 minutes
      await cache.set(`user:${decoded.id}`, user, 300);
    }
    
    // Check if user is active
    if (!user.is_active) {
      throw new ApiError(403, 'Account is deactivated');
    }
    
    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    throw error;
  }
});

/**
 * Verify API key
 */
const verifyApiKey = asyncHandler(async (req, res, next) => {
  // Get API key from header
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    throw new ApiError(401, 'No API key provided');
  }
  
  // Check cache first
  let cachedKey = await cache.get(`apikey:${apiKey}`);
  
  if (!cachedKey) {
    // Hash the API key
    const keyHash = ApiKey.hashKey(apiKey);
    
    // Find API key in database
    const apiKeyRecord = await ApiKey.findOne({
      where: { key_hash: keyHash },
      include: [{
        model: User,
        as: 'user',
      }],
    });
    
    if (!apiKeyRecord) {
      throw new ApiError(401, 'Invalid API key');
    }
    
    // Cache API key for 10 minutes
    await cache.set(`apikey:${apiKey}`, apiKeyRecord, 600);
    cachedKey = apiKeyRecord;
  }
  
  // Check if API key is active
  if (!cachedKey.isActive()) {
    throw new ApiError(403, 'API key is inactive or expired');
  }
  
  // Check if user is active
  if (!cachedKey.user.is_active) {
    throw new ApiError(403, 'Account is deactivated');
  }
  
  // Check IP whitelist if configured
  if (cachedKey.allowed_ips && cachedKey.allowed_ips.length > 0) {
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!cachedKey.allowed_ips.includes(clientIp)) {
      throw new ApiError(403, 'IP address not allowed');
    }
  }
  
  // Increment usage count (async, don't wait)
  ApiKey.findByPk(cachedKey.id).then((key) => {
    if (key) key.incrementUsage();
  });
  
  // Attach user and API key to request
  req.user = cachedKey.user;
  req.apiKey = cachedKey;
  
  next();
});

/**
 * Authenticate with either JWT or API key
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const hasToken = req.headers.authorization?.startsWith('Bearer ');
  const hasApiKey = req.headers['x-api-key'];
  
  if (hasToken) {
    return verifyToken(req, res, next);
  } else if (hasApiKey) {
    return verifyApiKey(req, res, next);
  } else {
    throw new ApiError(401, 'Authentication required');
  }
});

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions');
    }
    
    next();
  };
};

/**
 * Check if user has required scope (for API keys)
 */
const requireScope = (...scopes) => {
  return (req, res, next) => {
    // If authenticated with JWT, allow all scopes
    if (req.token) {
      return next();
    }
    
    // If authenticated with API key, check scopes
    if (req.apiKey) {
      const hasScope = scopes.some((scope) => req.apiKey.scopes.includes(scope));
      if (!hasScope) {
        throw new ApiError(403, `Required scope: ${scopes.join(' or ')}`);
      }
      return next();
    }
    
    throw new ApiError(401, 'Authentication required');
  };
};

/**
 * Optional authentication
 * Attaches user if authenticated, but doesn't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    await authenticate(req, res, next);
  } catch (error) {
    // Continue without authentication
    next();
  }
});

module.exports = {
  verifyToken,
  verifyApiKey,
  authenticate,
  authorize,
  requireScope,
  optionalAuth,
};

