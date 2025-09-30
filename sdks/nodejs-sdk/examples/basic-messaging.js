/**
 * Basic Messaging Example
 * Demonstrates how to send different types of messages using the SDK
 * 
 * SDK_EXAMPLE: This example shows the basic usage of the WhatsApp Platform SDK
 */

const WhatsAppAPI = require('../src/index');

// Initialize the client
const client = new WhatsAppAPI({
  apiKey: process.env.WHATSAPP_API_KEY || 'your-api-key',
  baseUrl: process.env.WHATSAPP_API_URL || 'http://localhost:3000'
});

/**
 * Example 1: Create a session and get QR code
 */
async function createSession() {
  console.log('Creating new WhatsApp session...');
  
  try {
    // Create session
    const session = await client.sessions.create({
      name: 'My First Session'
    });
    
    console.log('Session created:', session.data.id);
    
    // Wait a moment for QR code generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get QR code
    const qr = await client.sessions.getQR(session.data.id);
    
    if (qr.data.qrCode) {
      console.log('Scan this QR code with WhatsApp:');
      console.log(qr.data.qrCode);
    } else {
      console.log('Session status:', qr.data.status);
    }
    
    return session.data.id;
  } catch (error) {
    console.error('Error creating session:', error.message);
    throw error;
  }
}

/**
 * Example 2: Send a text message
 */
async function sendTextMessage(sessionId, phoneNumber) {
  console.log('\nSending text message...');
  
  try {
    const message = await client.messages.sendText({
      sessionId: sessionId,
      to: phoneNumber,
      message: 'Hello! This is a test message from WhatsApp API Platform.'
    });
    
    console.log('Message sent successfully!');
    console.log('Message ID:', message.data.id);
    console.log('Status:', message.data.status);
    
    return message.data.id;
  } catch (error) {
    console.error('Error sending message:', error.message);
    throw error;
  }
}

/**
 * Example 3: Send an image with caption
 */
async function sendImage(sessionId, phoneNumber) {
  console.log('\nSending image...');
  
  try {
    const message = await client.messages.sendMedia({
      sessionId: sessionId,
      to: phoneNumber,
      type: 'image',
      mediaUrl: 'https://picsum.photos/800/600',
      caption: 'Check out this beautiful image! 📸'
    });
    
    console.log('Image sent successfully!');
    console.log('Message ID:', message.data.id);
    
    return message.data.id;
  } catch (error) {
    console.error('Error sending image:', error.message);
    throw error;
  }
}

/**
 * Example 4: Send a location
 */
async function sendLocation(sessionId, phoneNumber) {
  console.log('\nSending location...');
  
  try {
    const message = await client.messages.sendLocation({
      sessionId: sessionId,
      to: phoneNumber,
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco',
      address: 'San Francisco, CA, USA'
    });
    
    console.log('Location sent successfully!');
    console.log('Message ID:', message.data.id);
    
    return message.data.id;
  } catch (error) {
    console.error('Error sending location:', error.message);
    throw error;
  }
}

/**
 * Example 5: Check message status
 */
async function checkMessageStatus(messageId) {
  console.log('\nChecking message status...');
  
  try {
    const status = await client.messages.getStatus(messageId);
    
    console.log('Message status:', status.data.status);
    console.log('Sent at:', status.data.sent_at);
    console.log('Delivered at:', status.data.delivered_at);
    console.log('Read at:', status.data.read_at);
  } catch (error) {
    console.error('Error checking status:', error.message);
    throw error;
  }
}

/**
 * Example 6: Get message history
 */
async function getMessageHistory(sessionId) {
  console.log('\nFetching message history...');
  
  try {
    const messages = await client.messages.list({
      sessionId: sessionId,
      page: 1,
      limit: 10
    });
    
    console.log(`Found ${messages.data.total} messages`);
    console.log('Recent messages:');
    
    messages.data.items.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.direction}] ${msg.from} -> ${msg.to}: ${msg.content || msg.type}`);
    });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    throw error;
  }
}

/**
 * Example 7: List all sessions
 */
async function listSessions() {
  console.log('\nListing all sessions...');
  
  try {
    const sessions = await client.sessions.list();
    
    console.log(`Found ${sessions.data.length} sessions:`);
    
    sessions.data.forEach((session, index) => {
      console.log(`${index + 1}. ${session.name} (${session.status}) - ${session.phone_number || 'Not connected'}`);
    });
  } catch (error) {
    console.error('Error listing sessions:', error.message);
    throw error;
  }
}

/**
 * Main function - Run all examples
 */
async function main() {
  console.log('=== WhatsApp Platform SDK - Basic Messaging Examples ===\n');
  
  try {
    // Example 1: List existing sessions
    await listSessions();
    
    // For the following examples, you'll need:
    // 1. A valid session ID (create one or use existing)
    // 2. A phone number to send messages to
    
    // Uncomment and configure these to run the examples:
    
    /*
    const sessionId = 'your-session-id'; // Or create new: await createSession();
    const phoneNumber = '1234567890'; // Replace with actual phone number
    
    // Example 2: Send text message
    const textMessageId = await sendTextMessage(sessionId, phoneNumber);
    
    // Example 3: Send image
    await sendImage(sessionId, phoneNumber);
    
    // Example 4: Send location
    await sendLocation(sessionId, phoneNumber);
    
    // Example 5: Check message status
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit
    await checkMessageStatus(textMessageId);
    
    // Example 6: Get message history
    await getMessageHistory(sessionId);
    */
    
    console.log('\n=== Examples completed successfully! ===');
    console.log('\nTo run the full examples:');
    console.log('1. Set your API key: export WHATSAPP_API_KEY=your-api-key');
    console.log('2. Uncomment the examples in the main() function');
    console.log('3. Configure sessionId and phoneNumber');
    console.log('4. Run: node examples/basic-messaging.js');
    
  } catch (error) {
    console.error('\n=== Error running examples ===');
    console.error(error);
    process.exit(1);
  }
}

// Run the examples
if (require.main === module) {
  main();
}

module.exports = {
  createSession,
  sendTextMessage,
  sendImage,
  sendLocation,
  checkMessageStatus,
  getMessageHistory,
  listSessions
};

