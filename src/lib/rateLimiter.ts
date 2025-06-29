import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// Configure different limiters based on WhatsApp's limits
// Single message rate limiter - 30 messages per minute
export const messageLimiter = new RateLimiterMemory({
  points: 30,         // Max messages per duration
  duration: 60,       // Duration in seconds (1 minute)
  blockDuration: 120, // Block duration if exceeded (2 minutes)
});

// Bulk message rate limiter - 200 messages per hour
export const bulkLimiter = new RateLimiterMemory({
  points: 200,        // Max messages
  duration: 3600,     // Per hour (in seconds)
  blockDuration: 3600 // Block for an hour if exceeded
});

// Daily message rate limiter - 1000 messages per day
export const dailyLimiter = new RateLimiterMemory({
  points: 1000,       // Max messages per day
  duration: 86400,    // Duration in seconds (24 hours)
  blockDuration: 86400 // Block for a day if exceeded
});

// Consume points from multiple limiters at once
export const consumeRateLimits = async (key: string, points = 1) => {
  try {
    // Try to consume points from all limiters
    await Promise.all([
      messageLimiter.consume(key, points),
      bulkLimiter.consume(key, points),
      dailyLimiter.consume(key, points)
    ]);
    return { success: true };
  } catch (error) {
    // One of the limiters rejected
    const rateLimiterError = error as RateLimiterRes;
    return { 
      success: false, 
      error: 'Rate limit exceeded. Please try again later.',
      msBeforeNext: rateLimiterError.msBeforeNext || 60000
    };
  }
}; 