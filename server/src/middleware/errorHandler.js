/**
 * Error Handling Middleware
 * Centralized error handling with standardized response format
 */

const logger = require('../utils/logger');
const config = require('../config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response format
 */
const errorResponse = (res, statusCode, message, errors = null, stack = null) => {
  const response = {
    success: false,
    error: {
      code: statusCode,
      message,
    },
  };

  if (errors) {
    response.error.details = errors;
  }

  if (config.env === 'development' && stack) {
    response.error.stack = stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Not Found (404) handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, errors } = err;

  // Log error
  logger.error('Error:', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
    user: req.user?.id,
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else {
      message = 'File upload error';
    }
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Validation error';
    errors = err.array().map((e) => ({
      field: e.param,
      message: e.msg,
    }));
  }

  return errorResponse(res, statusCode, message, errors, err.stack);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 * For express-validator
 */
const validationHandler = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new ApiError(
      400,
      'Validation error',
      errors.array().map((e) => ({
        field: e.param,
        message: e.msg,
        value: e.value,
      }))
    );
    return next(error);
  }
  
  next();
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationHandler,
};

