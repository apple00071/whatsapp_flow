/**
 * Webhook Server Example
 * Demonstrates how to receive and process webhook events from the WhatsApp Platform
 * 
 * SDK_EXAMPLE: This example shows how to set up a webhook server to receive real-time events
 */

const express = require('express');
const crypto = require('crypto');
const WhatsAppAPI = require('../src/index');

const app = express();
app.use(express.json());

// Initialize the SDK client
const client = new WhatsAppAPI({
  apiKey: process.env.WHATSAPP_API_KEY || 'your-api-key',
  baseUrl: process.env.WHATSAPP_API_URL || 'http://localhost:3000'
});

// Webhook secret for signature verification
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

/**
 * Verify webhook signature
 * This ensures the webhook request is actually from the WhatsApp Platform
 */
function verifyWebhookSignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Webhook endpoint
 * Receives events from the WhatsApp Platform
 */
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  const payload = req.body;
  
  console.log(`\n[${new Date().toISOString()}] Received webhook event: ${event}`);
  
  // Verify signature
  if (!signature || !verifyWebhookSignature(payload, signature)) {
    console.error('Invalid webhook signature!');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process event based on type
  switch (event) {
    case 'message.received':
      handleMessageReceived(payload.data);
      break;
      
    case 'message.status':
      handleMessageStatus(payload.data);
      break;
      
    case 'session.connected':
      handleSessionConnected(payload.data);
      break;
      
    case 'session.disconnected':
      handleSessionDisconnected(payload.data);
      break;
      
    case 'session.qr':
      handleSessionQR(payload.data);
      break;
      
    default:
      console.log('Unknown event type:', event);
  }
  
  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ success: true });
});

/**
 * Handle incoming message
 */
async function handleMessageReceived(data) {
  console.log('New message received:');
  console.log(`  From: ${data.from}`);
  console.log(`  Type: ${data.type}`);
  console.log(`  Content: ${data.body || '[Media]'}`);
  
  // Example: Auto-reply to messages
  if (data.body && data.body.toLowerCase().includes('hello')) {
    try {
      await client.messages.sendText({
        sessionId: data.sessionId,
        to: data.from,
        message: 'Hello! Thanks for your message. How can I help you today?'
      });
      console.log('  -> Auto-reply sent');
    } catch (error) {
      console.error('  -> Error sending auto-reply:', error.message);
    }
  }
  
  // Example: Handle commands
  if (data.body && data.body.startsWith('/')) {
    await handleCommand(data);
  }
}

/**
 * Handle message status updates
 */
function handleMessageStatus(data) {
  console.log('Message status update:');
  console.log(`  Message ID: ${data.messageId}`);
  console.log(`  Status: ${data.status}`);
}

/**
 * Handle session connected event
 */
function handleSessionConnected(data) {
  console.log('Session connected:');
  console.log(`  Session ID: ${data.sessionId}`);
  console.log(`  Phone Number: ${data.phoneNumber}`);
  
  // You could send a notification, update database, etc.
}

/**
 * Handle session disconnected event
 */
function handleSessionDisconnected(data) {
  console.log('Session disconnected:');
  console.log(`  Session ID: ${data.sessionId}`);
  console.log(`  Reason: ${data.reason}`);
  
  // You could attempt to reconnect, send alerts, etc.
}

/**
 * Handle QR code generation
 */
function handleSessionQR(data) {
  console.log('QR code generated:');
  console.log(`  Session ID: ${data.sessionId}`);
  console.log('  Scan the QR code to connect');
  
  // You could display the QR code in your UI, send via email, etc.
}

/**
 * Handle bot commands
 */
async function handleCommand(data) {
  const command = data.body.toLowerCase().trim();
  
  console.log(`  Processing command: ${command}`);
  
  let response;
  
  switch (command) {
    case '/help':
      response = `Available commands:
/help - Show this help message
/status - Check bot status
/time - Get current time
/info - Get session information`;
      break;
      
    case '/status':
      response = 'Bot is running and ready to receive messages! ✅';
      break;
      
    case '/time':
      response = `Current time: ${new Date().toLocaleString()}`;
      break;
      
    case '/info':
      try {
        const session = await client.sessions.get(data.sessionId);
        response = `Session Information:
Name: ${session.data.name}
Status: ${session.data.status}
Phone: ${session.data.phone_number || 'Not connected'}`;
      } catch (error) {
        response = 'Error fetching session information';
      }
      break;
      
    default:
      response = 'Unknown command. Type /help for available commands.';
  }
  
  // Send response
  try {
    await client.messages.sendText({
      sessionId: data.sessionId,
      to: data.from,
      message: response
    });
    console.log('  -> Command response sent');
  } catch (error) {
    console.error('  -> Error sending command response:', error.message);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Register webhook with the platform
 */
async function registerWebhook(webhookUrl) {
  console.log('Registering webhook with platform...');
  
  try {
    const webhook = await client.webhooks.create({
      url: webhookUrl,
      events: [
        'message.received',
        'message.status',
        'session.connected',
        'session.disconnected',
        'session.qr'
      ]
    });
    
    console.log('Webhook registered successfully!');
    console.log('Webhook ID:', webhook.data.id);
    
    return webhook.data.id;
  } catch (error) {
    console.error('Error registering webhook:', error.message);
    throw error;
  }
}

/**
 * Start the webhook server
 */
async function startServer() {
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log('=== WhatsApp Platform Webhook Server ===\n');
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('\nWaiting for webhook events...\n');
  });
  
  // Optionally register webhook automatically
  // Uncomment this if you want to auto-register on startup
  /*
  const webhookUrl = process.env.WEBHOOK_URL || `http://your-server.com:${PORT}/webhook`;
  try {
    await registerWebhook(webhookUrl);
  } catch (error) {
    console.error('Failed to register webhook:', error.message);
  }
  */
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  registerWebhook
};

