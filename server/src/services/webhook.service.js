/**
 * Webhook Service
 * Handles webhook delivery with retry logic and signature verification
 */

const axios = require('axios');
const crypto = require('crypto');
const { Webhook, Session } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');
const Queue = require('bull');

/**
 * Create webhook queue for async processing
 */
const webhookQueue = new Queue('webhooks', config.queue.redisUrl, {
  defaultJobOptions: {
    attempts: config.webhook.retryAttempts,
    backoff: {
      type: 'exponential',
      delay: config.webhook.retryDelay,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/**
 * Process webhook delivery jobs
 */
webhookQueue.process(config.queue.concurrency, async (job) => {
  const { webhookId, event, payload } = job.data;
  
  try {
    const webhook = await Webhook.findByPk(webhookId);
    
    if (!webhook || !webhook.isActive()) {
      logger.warn(`Webhook ${webhookId} is inactive, skipping delivery`);
      return;
    }

    await deliverWebhook(webhook, event, payload);
    
    // Update success timestamp
    await webhook.resetFailures();
    
    logger.info(`Webhook delivered successfully: ${webhookId}`);
  } catch (error) {
    logger.error(`Webhook delivery failed: ${webhookId}`, error);
    
    // Update failure count
    const webhook = await Webhook.findByPk(webhookId);
    if (webhook) {
      await webhook.update({
        failure_count: webhook.failure_count + 1,
        last_failure_at: new Date(),
        last_error: error.message,
      });

      // Temporarily disable webhook after too many failures
      if (webhook.failure_count >= config.webhook.retryAttempts * 3) {
        await webhook.temporarilyDisable(3600000); // 1 hour
        logger.warn(`Webhook ${webhookId} temporarily disabled due to repeated failures`);
      }
    }
    
    throw error;
  }
});

/**
 * Deliver webhook to URL
 * @param {Object} webhook - Webhook record
 * @param {string} event - Event name
 * @param {Object} payload - Event payload
 */
async function deliverWebhook(webhook, event, payload) {
  const webhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  // Generate signature for verification
  const signature = generateSignature(webhookPayload, webhook.secret || config.webhook.secret);

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Webhook-Event': event,
    'X-Webhook-Signature': signature,
    'X-Webhook-ID': webhook.id,
    'User-Agent': 'WhatsApp-API-Platform/1.0',
    ...webhook.headers,
  };

  // Send webhook request
  const response = await axios.post(webhook.url, webhookPayload, {
    headers,
    timeout: config.webhook.timeout,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  return response.data;
}

/**
 * Generate HMAC signature for webhook payload
 * @param {Object} payload - Webhook payload
 * @param {string} secret - Webhook secret
 * @returns {string} HMAC signature
 */
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

/**
 * Verify webhook signature
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Provided signature
 * @param {string} secret - Webhook secret
 * @returns {boolean} Verification result
 */
function verifySignature(payload, signature, secret) {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Emit webhook event
 * @param {string} sessionId - Session ID
 * @param {string} event - Event name
 * @param {Object} payload - Event payload
 */
async function emitEvent(sessionId, event, payload) {
  try {
    // Find session
    const session = await Session.findByPk(sessionId);
    if (!session) {
      logger.warn(`Session ${sessionId} not found for webhook event ${event}`);
      return;
    }

    // Find webhooks for this session and event
    const webhooks = await Webhook.findAll({
      where: {
        is_active: true,
      },
    });

    // Filter webhooks that match the session and event
    const matchingWebhooks = webhooks.filter((webhook) => {
      // Check if webhook is for this session or global
      if (webhook.session_id && webhook.session_id !== sessionId) {
        return false;
      }

      // Check if webhook is for this user
      if (webhook.user_id !== session.user_id) {
        return false;
      }

      // Check if webhook listens to this event
      if (webhook.events.length > 0 && !webhook.events.includes(event)) {
        return false;
      }

      return true;
    });

    logger.info(`Emitting event ${event} to ${matchingWebhooks.length} webhooks`);

    // Queue webhook deliveries
    for (const webhook of matchingWebhooks) {
      await webhookQueue.add({
        webhookId: webhook.id,
        event,
        payload,
      });
    }
  } catch (error) {
    logger.error(`Error emitting webhook event ${event}:`, error);
  }
}

/**
 * Test webhook delivery
 * @param {string} webhookId - Webhook ID
 */
async function testWebhook(webhookId) {
  const webhook = await Webhook.findByPk(webhookId);
  
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  const testPayload = {
    test: true,
    message: 'This is a test webhook delivery',
  };

  await deliverWebhook(webhook, 'webhook.test', testPayload);
}

/**
 * Get webhook queue statistics
 */
async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    webhookQueue.getWaitingCount(),
    webhookQueue.getActiveCount(),
    webhookQueue.getCompletedCount(),
    webhookQueue.getFailedCount(),
    webhookQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

module.exports = {
  emitEvent,
  testWebhook,
  verifySignature,
  generateSignature,
  getQueueStats,
  webhookQueue,
};

