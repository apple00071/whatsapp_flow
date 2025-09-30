/**
 * Health Check Routes
 * Provides system health and status endpoints
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');
const { redisClient } = require('../config/redis');
const config = require('../config');

/**
 * @route   GET /api/v1/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
}));

/**
 * @route   GET /api/v1/health/detailed
 * @desc    Detailed health check with service status
 * @access  Public
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const health = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    services: {},
  };

  // Check database
  try {
    await sequelize.authenticate();
    health.services.database = {
      status: 'healthy',
      type: 'postgresql',
    };
  } catch (error) {
    health.status = 'unhealthy';
    health.services.database = {
      status: 'unhealthy',
      error: error.message,
    };
  }

  // Check Redis
  try {
    await redisClient.ping();
    health.services.redis = {
      status: 'healthy',
    };
  } catch (error) {
    health.status = 'unhealthy';
    health.services.redis = {
      status: 'unhealthy',
      error: error.message,
    };
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}));

/**
 * @route   GET /api/v1/health/metrics
 * @desc    Prometheus-style metrics
 * @access  Public
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const metrics = [];
  
  // Uptime
  metrics.push(`# HELP process_uptime_seconds Process uptime in seconds`);
  metrics.push(`# TYPE process_uptime_seconds gauge`);
  metrics.push(`process_uptime_seconds ${process.uptime()}`);
  
  // Memory
  const memUsage = process.memoryUsage();
  metrics.push(`# HELP process_memory_rss_bytes Resident set size in bytes`);
  metrics.push(`# TYPE process_memory_rss_bytes gauge`);
  metrics.push(`process_memory_rss_bytes ${memUsage.rss}`);
  
  metrics.push(`# HELP process_memory_heap_used_bytes Heap used in bytes`);
  metrics.push(`# TYPE process_memory_heap_used_bytes gauge`);
  metrics.push(`process_memory_heap_used_bytes ${memUsage.heapUsed}`);
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics.join('\n'));
}));

module.exports = router;

