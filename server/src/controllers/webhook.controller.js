/**
 * Webhook Controller
 * Handles webhook management operations
 */

const { Webhook, Session } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const webhookService = require('../services/webhook.service');

/**
 * Get all webhooks for user
 */
exports.listWebhooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Get user's sessions
  const sessions = await Session.findAll({
    where: { user_id: req.user.id },
    attributes: ['id'],
  });

  const sessionIds = sessions.map(s => s.id);

  const { count, rows: webhooks } = await Webhook.findAndCountAll({
    where: { session_id: sessionIds },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: Session,
        as: 'session',
        attributes: ['id', 'name'],
      },
    ],
  });

  res.json({
    success: true,
    data: {
      webhooks,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    },
  });
};

/**
 * Get webhook by ID
 */
exports.getWebhook = async (req, res) => {
  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  res.json({
    success: true,
    data: webhook,
  });
};

/**
 * Create a new webhook
 */
exports.createWebhook = async (req, res) => {
  const { session_id, url, events, secret } = req.body;

  // Verify session belongs to user
  const session = await Session.findOne({
    where: {
      id: session_id,
      user_id: req.user.id,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Validate events
  const validEvents = [
    'message.received',
    'message.status',
    'session.connected',
    'session.disconnected',
    'session.qr',
  ];

  const invalidEvents = events.filter(e => !validEvents.includes(e));
  if (invalidEvents.length > 0) {
    throw new ApiError(400, `Invalid events: ${invalidEvents.join(', ')}`);
  }

  const webhook = await Webhook.create({
    session_id,
    url,
    events,
    secret: secret || webhookService.generateSecret(),
    is_active: true,
  });

  res.status(201).json({
    success: true,
    message: 'Webhook created successfully',
    data: webhook,
  });
};

/**
 * Update webhook
 */
exports.updateWebhook = async (req, res) => {
  const { url, events, is_active } = req.body;

  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  const updates = {};
  if (url !== undefined) updates.url = url;
  if (is_active !== undefined) updates.is_active = is_active;
  
  if (events !== undefined) {
    // Validate events
    const validEvents = [
      'message.received',
      'message.status',
      'session.connected',
      'session.disconnected',
      'session.qr',
    ];

    const invalidEvents = events.filter(e => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      throw new ApiError(400, `Invalid events: ${invalidEvents.join(', ')}`);
    }

    updates.events = events;
  }

  await webhook.update(updates);

  res.json({
    success: true,
    message: 'Webhook updated successfully',
    data: webhook,
  });
};

/**
 * Delete webhook
 */
exports.deleteWebhook = async (req, res) => {
  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  await webhook.destroy();

  res.json({
    success: true,
    message: 'Webhook deleted successfully',
  });
};

/**
 * Regenerate webhook secret
 */
exports.regenerateSecret = async (req, res) => {
  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  const newSecret = webhookService.generateSecret();
  await webhook.update({ secret: newSecret });

  res.json({
    success: true,
    message: 'Webhook secret regenerated successfully',
    data: {
      secret: newSecret,
    },
  });
};

/**
 * Test webhook delivery
 */
exports.testWebhook = async (req, res) => {
  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  // Send test event
  const testPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook event',
      session_id: webhook.session_id,
    },
  };

  try {
    await webhookService.emitEvent(webhook.session_id, 'webhook.test', testPayload.data);

    res.json({
      success: true,
      message: 'Test webhook sent successfully',
      data: {
        url: webhook.url,
        payload: testPayload,
      },
    });
  } catch (error) {
    throw new ApiError(500, `Failed to send test webhook: ${error.message}`);
  }
};

/**
 * Get webhook delivery logs
 */
exports.getWebhookLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  // TODO: Implement webhook delivery logging
  // For now, return basic stats from the webhook model

  res.json({
    success: true,
    data: {
      webhook_id: webhook.id,
      stats: {
        total_failures: webhook.failure_count,
        last_failure: webhook.last_failure_at,
        is_active: webhook.is_active,
      },
      logs: [], // TODO: Implement actual logging
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    },
  });
};

/**
 * Reset webhook failure count
 */
exports.resetFailures = async (req, res) => {
  const webhook = await Webhook.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!webhook) {
    throw new ApiError(404, 'Webhook not found');
  }

  await webhook.update({
    failure_count: 0,
    last_failure_at: null,
    is_active: true,
  });

  res.json({
    success: true,
    message: 'Webhook failures reset successfully',
    data: webhook,
  });
};

