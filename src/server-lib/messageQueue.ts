import Queue from 'bull';
import Redis from 'ioredis';
import { getWhatsAppClient } from './whatsappClient';
import { consumeRateLimits } from './rateLimiter';

// Redis configuration from environment variables
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
};

// Message interface
interface MessageJob {
  to: string;
  message: string;
  userId?: string; // For tracking who sent the message
  templateId?: string; // If using a template
}

// Create the message queue
export const messageQueue = new Queue<MessageJob>('whatsapp-messages', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: 100, // Keep last 100 failed jobs
  }
});

// Create the bulk message queue with lower concurrency
export const bulkMessageQueue = new Queue<MessageJob>('whatsapp-bulk-messages', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: 100,
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
  
  // Get WhatsApp client and send message
  const whatsappClient = getWhatsAppClient();
  if (!whatsappClient) {
    throw new Error('WhatsApp client is not initialized');
  }
  
  try {
    // Send the message
    const result = await whatsappClient.sendMessage(to, message);
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
  
  // Get WhatsApp client and send message
  const whatsappClient = getWhatsAppClient();
  if (!whatsappClient) {
    throw new Error('WhatsApp client is not initialized');
  }
  
  try {
    // Send the message
    const result = await whatsappClient.sendMessage(to, message);
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
export const queueMessage = async (to: string, message: string, userId?: string): Promise<string> => {
  const job = await messageQueue.add({
    to,
    message,
    userId
  });
  return job.id.toString();
};

// Helper function to add messages to the bulk queue
export const queueBulkMessages = async (messages: MessageJob[]): Promise<string[]> => {
  const jobs = await Promise.all(
    messages.map(msg => bulkMessageQueue.add(msg))
  );
  return jobs.map(job => job.id.toString());
}; 