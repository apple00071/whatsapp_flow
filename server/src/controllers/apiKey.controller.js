/**
 * API Key Controller
 * Handles API key management operations
 */

const { ApiKey } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a new API key
 */
const generateApiKey = () => {
  const prefix = 'sk';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
};

/**
 * Get all API keys for user
 */
exports.listApiKeys = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: apiKeys } = await ApiKey.findAndCountAll({
    where: { user_id: req.user.id },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['key_hash'] },
  });

  res.json({
    success: true,
    data: {
      apiKeys,
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
 * Get API key by ID
 */
exports.getApiKey = async (req, res) => {
  const apiKey = await ApiKey.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
    attributes: { exclude: ['key_hash'] },
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  res.json({
    success: true,
    data: apiKey,
  });
};

/**
 * Create a new API key
 */
exports.createApiKey = async (req, res) => {
  const { name, scopes, expires_at, rate_limit, ip_whitelist } = req.body;

  // Validate scopes
  const validScopes = [
    'messages:read',
    'messages:write',
    'sessions:read',
    'sessions:write',
    'contacts:read',
    'contacts:write',
    'groups:read',
    'groups:write',
    'webhooks:read',
    'webhooks:write',
  ];

  const invalidScopes = scopes.filter(s => !validScopes.includes(s));
  if (invalidScopes.length > 0) {
    throw new ApiError(400, `Invalid scopes: ${invalidScopes.join(', ')}`);
  }

  // Generate API key
  const key = generateApiKey();
  const keyHash = await bcrypt.hash(key, 10);

  // Create API key
  const apiKey = await ApiKey.create({
    user_id: req.user.id,
    name,
    key_hash: keyHash,
    key_prefix: key.substring(0, 10),
    scopes,
    expires_at: expires_at || null,
    rate_limit: rate_limit || null,
    ip_whitelist: ip_whitelist || [],
    is_active: true,
  });

  // Return the plain key only once
  res.status(201).json({
    success: true,
    message: 'API key created successfully. Save this key - it will not be shown again!',
    data: {
      id: apiKey.id,
      key: key, // Only shown once!
      name: apiKey.name,
      scopes: apiKey.scopes,
      expires_at: apiKey.expires_at,
      created_at: apiKey.created_at,
    },
  });
};

/**
 * Update API key
 */
exports.updateApiKey = async (req, res) => {
  const { name, scopes, is_active, rate_limit, ip_whitelist } = req.body;

  const apiKey = await ApiKey.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (is_active !== undefined) updates.is_active = is_active;
  if (rate_limit !== undefined) updates.rate_limit = rate_limit;
  if (ip_whitelist !== undefined) updates.ip_whitelist = ip_whitelist;

  if (scopes !== undefined) {
    // Validate scopes
    const validScopes = [
      'messages:read',
      'messages:write',
      'sessions:read',
      'sessions:write',
      'contacts:read',
      'contacts:write',
      'groups:read',
      'groups:write',
      'webhooks:read',
      'webhooks:write',
    ];

    const invalidScopes = scopes.filter(s => !validScopes.includes(s));
    if (invalidScopes.length > 0) {
      throw new ApiError(400, `Invalid scopes: ${invalidScopes.join(', ')}`);
    }

    updates.scopes = scopes;
  }

  await apiKey.update(updates);

  res.json({
    success: true,
    message: 'API key updated successfully',
    data: apiKey,
  });
};

/**
 * Delete API key
 */
exports.deleteApiKey = async (req, res) => {
  const apiKey = await ApiKey.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  await apiKey.destroy();

  res.json({
    success: true,
    message: 'API key deleted successfully',
  });
};

/**
 * Revoke API key (soft delete - mark as inactive)
 */
exports.revokeApiKey = async (req, res) => {
  const apiKey = await ApiKey.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  await apiKey.update({ is_active: false });

  res.json({
    success: true,
    message: 'API key revoked successfully',
    data: apiKey,
  });
};

/**
 * Regenerate API key
 */
exports.regenerateApiKey = async (req, res) => {
  const apiKey = await ApiKey.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  // Generate new key
  const newKey = generateApiKey();
  const keyHash = await bcrypt.hash(newKey, 10);

  await apiKey.update({
    key_hash: keyHash,
    key_prefix: newKey.substring(0, 10),
    last_used_at: null,
    is_active: true,
  });

  res.json({
    success: true,
    message: 'API key regenerated successfully. Save this key - it will not be shown again!',
    data: {
      id: apiKey.id,
      key: newKey, // Only shown once!
      name: apiKey.name,
      scopes: apiKey.scopes,
    },
  });
};

/**
 * Get API key usage statistics
 */
exports.getApiKeyStats = async (req, res) => {
  const apiKey = await ApiKey.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found');
  }

  // TODO: Implement actual usage tracking
  // For now, return basic info

  res.json({
    success: true,
    data: {
      api_key_id: apiKey.id,
      name: apiKey.name,
      created_at: apiKey.created_at,
      last_used_at: apiKey.last_used_at,
      is_active: apiKey.is_active,
      rate_limit: apiKey.rate_limit,
      usage: {
        // TODO: Implement actual usage tracking
        total_requests: 0,
        requests_today: 0,
        requests_this_month: 0,
      },
    },
  });
};

