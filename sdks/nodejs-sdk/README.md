# WhatsApp Flow API SDK for Node.js

Official Node.js SDK for the WhatsApp Flow API Platform - Send messages, manage sessions, and integrate WhatsApp into your applications.

## 🚀 Installation

```bash
npm install whatsapp-flow-api-sdk
```

## 📋 Quick Start

### 1. Initialize the Client

```javascript
const WhatsAppAPI = require('whatsapp-flow-api-sdk');

const client = new WhatsAppAPI({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://whatsapp-flow-i0e2.onrender.com' // Optional, this is the default
});
```

### 2. Create a Session and Get QR Code

```javascript
async function connectWhatsApp() {
  try {
    // Create a new session
    const session = await client.sessions.create({
      name: 'My Website Session'
    });
    
    console.log('Session created:', session.data.id);
    
    // Get QR code for scanning
    const qrData = await client.sessions.getQR(session.data.id);
    console.log('Scan this QR code with WhatsApp:', qrData.data.qrCode);
    
    // Wait for connection (you can poll the session status)
    await waitForConnection(session.data.id);
    
    return session.data.id;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function waitForConnection(sessionId) {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const session = await client.sessions.get(sessionId);
        if (session.data.status === 'connected') {
          console.log('WhatsApp connected!');
          resolve(session);
        } else if (session.data.status === 'failed') {
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        }
      } catch (error) {
        reject(error);
      }
    };
    checkStatus();
  });
}
```

### 3. Send Messages

```javascript
async function sendMessage(sessionId) {
  try {
    // Send text message
    const textMessage = await client.messages.sendText({
      sessionId: sessionId,
      to: '1234567890', // Phone number without + or country code
      message: 'Hello from WhatsApp Flow API!'
    });
    
    console.log('Text message sent:', textMessage.data.id);
    
    // Send media message
    const mediaMessage = await client.messages.sendMedia({
      sessionId: sessionId,
      to: '1234567890',
      type: 'image',
      mediaUrl: 'https://example.com/image.jpg',
      caption: 'Check out this image!'
    });
    
    console.log('Media message sent:', mediaMessage.data.id);
    
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}
```

## 📚 API Reference

### Sessions

```javascript
// Create session
const session = await client.sessions.create({ name: 'Session Name' });

// List sessions
const sessions = await client.sessions.list();

// Get session details
const session = await client.sessions.get(sessionId);

// Get QR code
const qrData = await client.sessions.getQR(sessionId);

// Delete session
await client.sessions.delete(sessionId);
```

### Messages

```javascript
// Send text message
await client.messages.sendText({
  sessionId: 'session-id',
  to: '1234567890',
  message: 'Hello World!'
});

// Send media message
await client.messages.sendMedia({
  sessionId: 'session-id',
  to: '1234567890',
  type: 'image', // image, video, audio, document
  mediaUrl: 'https://example.com/file.jpg',
  caption: 'Optional caption'
});

// Get message history
const messages = await client.messages.list({
  sessionId: 'session-id',
  page: 1,
  limit: 50
});
```

## 🔑 Authentication

Get your API key from the WhatsApp Flow dashboard:
1. Go to: https://dist-eta-sooty.vercel.app
2. Login to your account
3. Navigate to API Keys section
4. Create a new API key with required scopes

## 📖 Complete Example

```javascript
const WhatsAppAPI = require('whatsapp-flow-api-sdk');

async function main() {
  const client = new WhatsAppAPI({
    apiKey: 'your-api-key-here'
  });
  
  try {
    // 1. Create session
    console.log('Creating session...');
    const session = await client.sessions.create({
      name: 'Demo Session'
    });
    
    // 2. Get QR code
    console.log('Getting QR code...');
    const qrData = await client.sessions.getQR(session.data.id);
    console.log('QR Code:', qrData.data.qrCode);
    console.log('Scan this QR code with WhatsApp');
    
    // 3. Wait for connection
    console.log('Waiting for WhatsApp connection...');
    await waitForConnection(session.data.id);
    
    // 4. Send message
    console.log('Sending message...');
    await client.messages.sendText({
      sessionId: session.data.id,
      to: '1234567890',
      message: 'Hello from WhatsApp Flow API SDK!'
    });
    
    console.log('Message sent successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## 🌐 Links

- **API Dashboard**: https://dist-eta-sooty.vercel.app
- **API Documentation**: https://whatsapp-flow-i0e2.onrender.com/api/docs

## 📄 License

MIT License
