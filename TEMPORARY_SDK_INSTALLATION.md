# 🚀 Temporary SDK Installation (Before NPM Publication)

Since the SDK is not yet published to NPM, here are alternative ways to use the WhatsApp Flow API SDK in your projects.

## 📦 Option 1: Copy SDK Files Directly

### Step 1: Copy SDK to Your Project

```bash
# Create a libs directory in your project
mkdir libs

# Copy the SDK files
cp -r /path/to/whatsapp_flow/sdks/nodejs-sdk/src libs/whatsapp-sdk
```

### Step 2: Install Dependencies

```bash
# In your project directory
npm install axios form-data
```

### Step 3: Use the SDK

```javascript
// Import the SDK
const WhatsAppAPI = require('./libs/whatsapp-sdk/index.js');

// Use it normally
const client = new WhatsAppAPI({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://whatsapp-flow-i0e2.onrender.com'
});

// Send a message
async function sendMessage() {
  try {
    const session = await client.sessions.create({
      name: 'My Session'
    });
    
    const qr = await client.sessions.getQR(session.data.id);
    console.log('QR Code:', qr.data.qrCode);
    
    // Wait for connection, then send message
    await client.messages.sendText({
      sessionId: session.data.id,
      to: '1234567890',
      message: 'Hello from WhatsApp!'
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

sendMessage();
```

## 📦 Option 2: Use Direct HTTP Requests

If you prefer not to use the SDK, you can make direct HTTP requests:

### Install HTTP Client

```bash
npm install axios
```

### Example Usage

```javascript
const axios = require('axios');

const API_BASE = 'https://whatsapp-flow-i0e2.onrender.com/api/v1';
const API_KEY = 'your-api-key-here';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function whatsappExample() {
  try {
    // 1. Create session
    const sessionResponse = await api.post('/sessions', {
      name: 'Direct API Session'
    });
    const sessionId = sessionResponse.data.data.id;
    console.log('Session created:', sessionId);
    
    // 2. Get QR code
    const qrResponse = await api.get(`/sessions/${sessionId}/qr`);
    console.log('QR Code:', qrResponse.data.data.qrCode);
    
    // 3. Wait for connection (poll session status)
    await waitForConnection(sessionId);
    
    // 4. Send message
    const messageResponse = await api.post('/messages/send', {
      session_id: sessionId,
      to: '1234567890',
      content: 'Hello from direct API!'
    });
    console.log('Message sent:', messageResponse.data.data.id);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

async function waitForConnection(sessionId) {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const response = await api.get(`/sessions/${sessionId}`);
        const status = response.data.data.status;
        console.log('Session status:', status);
        
        if (status === 'connected') {
          resolve();
        } else if (status === 'failed') {
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        reject(error);
      }
    };
    checkStatus();
  });
}

whatsappExample();
```

## 📦 Option 3: Create Local NPM Package

### Step 1: Create Package Tarball

```bash
# In the SDK directory
cd sdks/nodejs-sdk
npm pack
```

This creates `whatsapp-flow-api-sdk-1.0.0.tgz`

### Step 2: Install in Your Project

```bash
# In your project directory
npm install /path/to/whatsapp-flow-api-sdk-1.0.0.tgz
```

### Step 3: Use Normally

```javascript
const WhatsAppAPI = require('whatsapp-flow-api-sdk');

const client = new WhatsAppAPI({
  apiKey: 'your-api-key-here'
});

// Use as documented in the SDK guide
```

## 🔧 React.js Integration Example

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WhatsAppIntegration = () => {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [sessionId, setSessionId] = useState('');

  const API_BASE = 'https://whatsapp-flow-i0e2.onrender.com/api/v1';
  const API_KEY = 'your-api-key-here';

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  const connectWhatsApp = async () => {
    try {
      // Create session
      const sessionResponse = await api.post('/sessions', {
        name: 'React App Session'
      });
      const newSessionId = sessionResponse.data.data.id;
      setSessionId(newSessionId);
      
      // Get QR code
      const qrResponse = await api.get(`/sessions/${newSessionId}/qr`);
      setQrCode(qrResponse.data.data.qrCode);
      
      // Poll for connection status
      const interval = setInterval(async () => {
        try {
          const statusResponse = await api.get(`/sessions/${newSessionId}`);
          const currentStatus = statusResponse.data.data.status;
          setStatus(currentStatus);
          
          if (currentStatus === 'connected') {
            clearInterval(interval);
            setQrCode('');
          }
        } catch (error) {
          console.error('Status check error:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || status !== 'connected') return;
    
    try {
      await api.post('/messages/send', {
        session_id: sessionId,
        to: '1234567890',
        content: 'Hello from React!'
      });
      alert('Message sent!');
    } catch (error) {
      console.error('Send error:', error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2>WhatsApp Integration</h2>
      <p>Status: {status}</p>
      
      {qrCode && (
        <div>
          <p>Scan this QR code with WhatsApp:</p>
          <pre>{qrCode}</pre>
        </div>
      )}
      
      <button onClick={connectWhatsApp} disabled={status === 'connected'}>
        Connect WhatsApp
      </button>
      
      <button onClick={sendMessage} disabled={status !== 'connected'}>
        Send Test Message
      </button>
    </div>
  );
};

export default WhatsAppIntegration;
```

## 📋 API Endpoints Reference

### Sessions
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions` - List sessions
- `GET /api/v1/sessions/{id}` - Get session details
- `GET /api/v1/sessions/{id}/qr` - Get QR code
- `DELETE /api/v1/sessions/{id}` - Delete session

### Messages
- `POST /api/v1/messages/send` - Send text message
- `POST /api/v1/messages/media` - Send media message
- `POST /api/v1/messages/location` - Send location
- `GET /api/v1/messages` - Get message history

### Authentication
- Header: `X-API-Key: your-api-key-here`
- Get API key from: https://dist-eta-sooty.vercel.app

## 🎯 Next Steps

1. Choose one of the options above
2. Get your API key from the dashboard
3. Test with a simple message
4. Integrate into your application
5. Wait for official NPM package publication

## 📞 Support

If you need help:
1. Check the API documentation
2. Test endpoints with Postman/curl
3. Verify your API key is correct
4. Ensure CORS is properly configured
