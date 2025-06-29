// In-memory implementation of message queue
const { getWhatsAppClient } = require('./whatsappClient');
const { consumeRateLimits } = require('./rateLimiter');

// In-memory queue
class InMemoryQueue {
  constructor(name, options = {}) {
    this.name = name;
    this.options = options;
    this.jobs = [];
    this.listeners = {};
    this.jobCounter = 1;
    this.isProcessing = false;
    this.processFn = null;
    this.concurrency = 1;
  }

  add(data) {
    const id = this.jobCounter++;
    const job = {
      id,
      data,
      attempts: 0,
      maxAttempts: this.options.defaultJobOptions?.attempts || 3,
      createdAt: new Date()
    };
    this.jobs.push(job);
    
    // Start processing if not already
    if (!this.isProcessing && this.processFn) {
      this._startProcessing();
    }
    
    return Promise.resolve({ id: id.toString() });
  }

  process(concurrencyOrFn, fn) {
    if (typeof concurrencyOrFn === 'function') {
      this.processFn = concurrencyOrFn;
      this.concurrency = 1;
    } else {
      this.concurrency = concurrencyOrFn;
      this.processFn = fn;
    }
    
    // Start processing if there are jobs
    if (this.jobs.length > 0) {
      this._startProcessing();
    }
    
    return this;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }

  _emit(event, ...args) {
    const listeners = this.listeners[event] || [];
    for (const listener of listeners) {
      listener(...args);
    }
  }

  async _startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    while (this.jobs.length > 0 && this.processFn) {
      // Process up to concurrency jobs at once
      const batch = this.jobs.splice(0, this.concurrency);
      
      await Promise.all(batch.map(async (job) => {
        try {
          job.attempts++;
          await this.processFn(job);
        } catch (err) {
          // Handle job failure
          if (job.attempts < job.maxAttempts) {
            // Retry the job
            this.jobs.push(job);
          } else {
            // Max attempts reached, emit failed event
            this._emit('failed', job, err);
          }
        }
      }));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }
}

// Create the message queue
const messageQueue = new InMemoryQueue('whatsapp-messages', {
  defaultJobOptions: {
    attempts: 3
  }
});

// Create the bulk message queue with lower concurrency
const bulkMessageQueue = new InMemoryQueue('whatsapp-bulk-messages', {
  defaultJobOptions: {
    attempts: 2
  }
});

// Process individual messages with random delays
messageQueue.process(async (job) => {
  const { to, message, userId } = job.data;
  
  // Check rate limits first
  const rateLimitKey = userId || to;
  const rateLimitResult = await consumeRateLimits(rateLimitKey);
  
  if (!rateLimitResult.success) {
    const timeToWait = rateLimitResult.msBeforeNext ? 
      Math.ceil(rateLimitResult.msBeforeNext / 1000) : 60;
    throw new Error(`Rate limit exceeded. Try again in ${timeToWait} seconds.`);
  }
  
  // Add random delay to appear more human-like (1-3 seconds)
  const delay = Math.floor(Math.random() * 2000) + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    // Use the global client variable from server.js
    const client = global.whatsappClient;
    
    if (!client) {
      throw new Error('WhatsApp client not available from server');
    }
    
    // Format the phone number
    let formattedNumber = to;
    if (!formattedNumber.includes('@c.us')) {
      // Remove any non-numeric characters
      let cleaned = to.replace(/\D/g, '');
      
      // Ensure the number has the country code
      if (!cleaned.startsWith('1') && !cleaned.startsWith('91')) {
        cleaned = '1' + cleaned; // Default to US country code
      }
      
      // Add the @c.us suffix required by WhatsApp Web
      formattedNumber = cleaned + '@c.us';
    }
    
    // Add slight variations to the message to avoid detection
    const position = Math.floor(Math.random() * message.length);
    const zwsp = '\u200B'; // Zero-width space
    const finalMessage = message.slice(0, position) + zwsp + message.slice(position);
    
    // Send the message
    const result = await client.sendMessage(formattedNumber, finalMessage);
    return { success: true, messageId: result.id._serialized };
  } catch (error) {
    console.error(`Failed to send message to ${to}:`, error);
    throw error;
  }
});

// Process bulk messages with longer delays between messages
bulkMessageQueue.process(5, async (job) => { // Process 5 jobs concurrently
  const { to, message, userId } = job.data;
  
  // Check rate limits first
  const rateLimitKey = userId || to;
  const rateLimitResult = await consumeRateLimits(rateLimitKey);
  
  if (!rateLimitResult.success) {
    const timeToWait = rateLimitResult.msBeforeNext ? 
      Math.ceil(rateLimitResult.msBeforeNext / 1000) : 60;
    throw new Error(`Rate limit exceeded. Try again in ${timeToWait} seconds.`);
  }
  
  // Add longer random delay for bulk messages (3-7 seconds)
  const delay = Math.floor(Math.random() * 4000) + 3000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    // Use the global client variable from server.js
    const client = global.whatsappClient;
    
    if (!client) {
      throw new Error('WhatsApp client not available from server');
    }
    
    // Format the phone number
    let formattedNumber = to;
    if (!formattedNumber.includes('@c.us')) {
      // Remove any non-numeric characters
      let cleaned = to.replace(/\D/g, '');
      
      // Ensure the number has the country code
      if (!cleaned.startsWith('1') && !cleaned.startsWith('91')) {
        cleaned = '1' + cleaned; // Default to US country code
      }
      
      // Add the @c.us suffix required by WhatsApp Web
      formattedNumber = cleaned + '@c.us';
    }
    
    // Add slight variations to the message to avoid detection
    const position = Math.floor(Math.random() * message.length);
    const zwsp = '\u200B'; // Zero-width space
    const finalMessage = message.slice(0, position) + zwsp + message.slice(position);
    
    // Send the message
    const result = await client.sendMessage(formattedNumber, finalMessage);
    return { success: true, messageId: result.id._serialized };
  } catch (error) {
    console.error(`Failed to send bulk message to ${to}:`, error);
    throw error;
  }
});

// Add event listeners for monitoring
messageQueue.on('failed', (job, err) => {
  console.error(`Message to ${job.data.to} failed:`, err);
});

bulkMessageQueue.on('failed', (job, err) => {
  console.error(`Bulk message to ${job.data.to} failed:`, err);
});

// Helper function to add a message to the queue
const queueMessage = async (to, message, userId) => {
  const job = await messageQueue.add({
    to,
    message,
    userId
  });
  return job.id.toString();
};

// Helper function to add messages to the bulk queue
const queueBulkMessages = async (messages) => {
  const jobs = await Promise.all(
    messages.map(msg => bulkMessageQueue.add(msg))
  );
  return jobs.map(job => job.id.toString());
};

module.exports = {
  messageQueue,
  bulkMessageQueue,
  queueMessage,
  queueBulkMessages
}; 