/**
 * WhatsApp Platform SDK for Node.js
 * Official SDK for interacting with the WhatsApp Programmable Messaging Platform
 * 
 * @example
 * const WhatsAppAPI = require('@whatsapp-platform/sdk');
 * 
 * const client = new WhatsAppAPI({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.yourplatform.com'
 * });
 * 
 * // Send a text message
 * await client.messages.sendText({
 *   sessionId: 'session-id',
 *   to: '1234567890',
 *   message: 'Hello from WhatsApp API!'
 * });
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Main WhatsApp API Client
 */
class WhatsAppAPI {
  /**
   * Create a new WhatsApp API client
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - API key for authentication
   * @param {string} [options.baseUrl='https://api.yourplatform.com'] - Base URL of the API
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @param {number} [options.maxRetries=3] - Maximum number of retry attempts
   */
  constructor(options = {}) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.yourplatform.com';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;

    // Create axios instance
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      timeout: this.timeout,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Platform-SDK-Node/1.0.0',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => this._handleError(error)
    );

    // Initialize resource modules
    this.sessions = new Sessions(this);
    this.messages = new Messages(this);
    this.contacts = new Contacts(this);
    this.groups = new Groups(this);
    this.webhooks = new Webhooks(this);
  }

  /**
   * Handle API errors
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error
      const apiError = new Error(error.response.data?.error?.message || 'API request failed');
      apiError.statusCode = error.response.status;
      apiError.details = error.response.data?.error?.details;
      throw apiError;
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Error setting up request
      throw error;
    }
  }

  /**
   * Make a request with retry logic
   * @private
   */
  async _requestWithRetry(config, retries = 0) {
    try {
      return await this.client.request(config);
    } catch (error) {
      if (retries < this.maxRetries && this._shouldRetry(error)) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this._requestWithRetry(config, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   * @private
   */
  _shouldRetry(error) {
    if (!error.statusCode) return true; // Network errors
    return error.statusCode >= 500 || error.statusCode === 429; // Server errors or rate limit
  }
}

/**
 * Sessions Resource
 * Manage WhatsApp sessions
 */
class Sessions {
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new WhatsApp session
   * @param {Object} data - Session data
   * @param {string} data.name - Session name
   * @returns {Promise<Object>} Created session
   */
  async create(data) {
    return this.client._requestWithRetry({
      method: 'POST',
      url: '/sessions',
      data,
    });
  }

  /**
   * List all sessions
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Object>} List of sessions
   */
  async list(params = {}) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: '/sessions',
      params,
    });
  }

  /**
   * Get session details
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async get(sessionId) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: `/sessions/${sessionId}`,
    });
  }

  /**
   * Get QR code for session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} QR code data
   */
  async getQR(sessionId) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: `/sessions/${sessionId}/qr`,
    });
  }

  /**
   * Delete session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(sessionId) {
    return this.client._requestWithRetry({
      method: 'DELETE',
      url: `/sessions/${sessionId}`,
    });
  }
}

/**
 * Messages Resource
 * Send and retrieve messages
 */
class Messages {
  constructor(client) {
    this.client = client;
  }

  /**
   * Send a text message
   * @param {Object} data - Message data
   * @param {string} data.sessionId - Session ID
   * @param {string} data.to - Recipient phone number
   * @param {string} data.message - Message text
   * @returns {Promise<Object>} Sent message
   */
  async sendText(data) {
    return this.client._requestWithRetry({
      method: 'POST',
      url: '/messages/send',
      data: {
        session_id: data.sessionId,
        to: data.to,
        type: 'text',
        content: data.message,
      },
    });
  }

  /**
   * Send a media message
   * @param {Object} data - Message data
   * @param {string} data.sessionId - Session ID
   * @param {string} data.to - Recipient phone number
   * @param {string} data.mediaUrl - Media URL or file path
   * @param {string} data.type - Media type (image, video, audio, document)
   * @param {string} [data.caption] - Media caption
   * @returns {Promise<Object>} Sent message
   */
  async sendMedia(data) {
    const formData = new FormData();
    formData.append('session_id', data.sessionId);
    formData.append('to', data.to);
    formData.append('type', data.type);

    if (data.caption) {
      formData.append('caption', data.caption);
    }

    // Check if mediaUrl is a file path or URL
    if (fs.existsSync(data.mediaUrl)) {
      formData.append('media', fs.createReadStream(data.mediaUrl));
    } else {
      formData.append('media_url', data.mediaUrl);
    }

    return this.client._requestWithRetry({
      method: 'POST',
      url: '/messages/media',
      data: formData,
      headers: formData.getHeaders(),
    });
  }

  /**
   * Send a location message
   * @param {Object} data - Message data
   * @param {string} data.sessionId - Session ID
   * @param {string} data.to - Recipient phone number
   * @param {number} data.latitude - Latitude
   * @param {number} data.longitude - Longitude
   * @param {string} [data.name] - Location name
   * @param {string} [data.address] - Location address
   * @returns {Promise<Object>} Sent message
   */
  async sendLocation(data) {
    return this.client._requestWithRetry({
      method: 'POST',
      url: '/messages/location',
      data: {
        session_id: data.sessionId,
        to: data.to,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          name: data.name,
          address: data.address,
        },
      },
    });
  }

  /**
   * Get message history
   * @param {Object} [params] - Query parameters
   * @param {string} [params.sessionId] - Filter by session ID
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=50] - Items per page
   * @returns {Promise<Object>} Message history
   */
  async list(params = {}) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: '/messages',
      params,
    });
  }

  /**
   * Get message status
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Message status
   */
  async getStatus(messageId) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: `/messages/${messageId}/status`,
    });
  }
}

/**
 * Contacts Resource
 * Manage contacts
 */
class Contacts {
  constructor(client) {
    this.client = client;
  }

  async list(params = {}) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: '/contacts',
      params,
    });
  }

  async create(data) {
    return this.client._requestWithRetry({
      method: 'POST',
      url: '/contacts',
      data,
    });
  }

  async get(contactId) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: `/contacts/${contactId}`,
    });
  }

  async update(contactId, data) {
    return this.client._requestWithRetry({
      method: 'PUT',
      url: `/contacts/${contactId}`,
      data,
    });
  }

  async delete(contactId) {
    return this.client._requestWithRetry({
      method: 'DELETE',
      url: `/contacts/${contactId}`,
    });
  }
}

/**
 * Groups Resource
 * Manage groups
 */
class Groups {
  constructor(client) {
    this.client = client;
  }

  async list(params = {}) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: '/groups',
      params,
    });
  }

  async get(groupId) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: `/groups/${groupId}`,
    });
  }
}

/**
 * Webhooks Resource
 * Manage webhooks
 */
class Webhooks {
  constructor(client) {
    this.client = client;
  }

  async list(params = {}) {
    return this.client._requestWithRetry({
      method: 'GET',
      url: '/webhooks',
      params,
    });
  }

  async create(data) {
    return this.client._requestWithRetry({
      method: 'POST',
      url: '/webhooks',
      data,
    });
  }

  async delete(webhookId) {
    return this.client._requestWithRetry({
      method: 'DELETE',
      url: `/webhooks/${webhookId}`,
    });
  }
}

module.exports = WhatsAppAPI;

