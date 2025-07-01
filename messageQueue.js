// In-memory implementation of message queue
const whatsappClient = require('./whatsappClient');
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

  _startProcessing() {
    this.isProcessing = true;
    this._processNextJob();
  }

  _processNextJob() {
    if (this.jobs.length === 0) {
      this.isProcessing = false;
      return;
    }

    const job = this.jobs.shift();
    
    // Process the job
    Promise.resolve()
      .then(() => this.processFn(job))
      .then((result) => {
        this._emitEvent('completed', { job, result });
      })
      .catch((err) => {
        job.attempts++;
        if (job.attempts < job.maxAttempts) {
          // Re-add the job to the end of the queue
          this.jobs.push(job);
        } else {
          // Job failed after max attempts
          this._emitEvent('failed', { job, error: err });
        }
      })
      .finally(() => {
        // Process next job
        setTimeout(() => this._processNextJob(), 50);
      });
  }

  _emitEvent(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in ${event} listener:`, err);
      }
    });
  }

  // Get queue status
  getStatus() {
    return {
      name: this.name,
      pending: this.jobs.length,
      processing: this.isProcessing
    };
  }
}

// Create message queues
const messageQueue = new InMemoryQueue('messages', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

const bulkMessageQueue = new InMemoryQueue('bulk-messages', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

// Setup message queue processing
messageQueue.process(async (job) => {
  const { to, message, userId } = job.data;
  
  // Check rate limits for this user
  if (userId) {
    await consumeRateLimits(userId);
  }
  
  // Send the message
  return await whatsappClient.sendMessage(to, message);
});

// Setup bulk message queue processing
bulkMessageQueue.process(5, async (job) => {
  const { to, message, userId, templateId } = job.data;
  
  // Check rate limits for this user
  if (userId) {
    await consumeRateLimits(userId);
  }
  
  // Send the message
  return await whatsappClient.sendMessage(to, message);
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