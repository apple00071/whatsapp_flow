/**
 * Simple rate limiter implementation for WhatsApp Flow
 */

const limits = {
  perMinute: process.env.MESSAGE_RATE_LIMIT_PER_MINUTE || 30,
  perHour: process.env.MESSAGE_RATE_LIMIT_PER_HOUR || 200,
  perDay: process.env.MESSAGE_RATE_LIMIT_PER_DAY || 1000
};

// Store for rate limits
const usageStore = {
  minute: { count: 0, resetAt: Date.now() + 60000 },
  hour: { count: 0, resetAt: Date.now() + 3600000 },
  day: { count: 0, resetAt: Date.now() + 86400000 }
};

/**
 * Check and consume rate limits
 * @returns {Object} Status of rate limits
 */
function consumeRateLimits() {
  const now = Date.now();
  
  // Reset counters if time has passed
  if (now > usageStore.minute.resetAt) {
    usageStore.minute = { count: 0, resetAt: now + 60000 };
  }
  
  if (now > usageStore.hour.resetAt) {
    usageStore.hour = { count: 0, resetAt: now + 3600000 };
  }
  
  if (now > usageStore.day.resetAt) {
    usageStore.day = { count: 0, resetAt: now + 86400000 };
  }
  
  // Increment counters
  usageStore.minute.count++;
  usageStore.hour.count++;
  usageStore.day.count++;
  
  // Check if any limit is exceeded
  const minuteLimitExceeded = usageStore.minute.count > limits.perMinute;
  const hourLimitExceeded = usageStore.hour.count > limits.perHour;
  const dayLimitExceeded = usageStore.day.count > limits.perDay;
  
  return {
    canSend: !(minuteLimitExceeded || hourLimitExceeded || dayLimitExceeded),
    minuteLimitExceeded,
    hourLimitExceeded,
    dayLimitExceeded,
    usage: {
      minute: {
        used: usageStore.minute.count,
        limit: limits.perMinute,
        resetsIn: Math.round((usageStore.minute.resetAt - now) / 1000)
      },
      hour: {
        used: usageStore.hour.count,
        limit: limits.perHour,
        resetsIn: Math.round((usageStore.hour.resetAt - now) / 1000)
      },
      day: {
        used: usageStore.day.count,
        limit: limits.perDay,
        resetsIn: Math.round((usageStore.day.resetAt - now) / 1000)
      }
    }
  };
}

module.exports = { consumeRateLimits }; 