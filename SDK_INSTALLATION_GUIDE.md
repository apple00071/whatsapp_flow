# 📦 WhatsApp API SDK Installation Guide

Complete guide for integrating the WhatsApp API SDK into external websites and applications.

## 🌐 Available SDKs

### 1. **JavaScript/Node.js SDK**
- **Location**: `sdks/javascript-sdk/`
- **Best for**: Web applications, Node.js backends
- **Installation**: NPM package

### 2. **Python SDK**
- **Location**: `sdks/python-sdk/`
- **Best for**: Python applications, Django/Flask backends
- **Installation**: pip package

### 3. **REST API**
- **Direct HTTP calls**
- **Best for**: Any language/framework
- **Installation**: HTTP client library

---

## 🚀 Quick Start Options

### Option A: JavaScript SDK (Recommended for Web)

#### **1. Install via NPM**
```bash
npm install whatsapp-flow-api-sdk
```

#### **2. Basic Usage**
```javascript
import WhatsAppAPI from 'whatsapp-flow-api-sdk';

// Initialize client
const client = new WhatsAppAPI({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://whatsapp-flow-i0e2.onrender.com/api/v1'
});

// Create session and get QR code
async function connectWhatsApp() {
  try {
    // 1. Create session
    const session = await client.sessions.create({
      name: 'My Website Session'
    });
    
    // 2. Get QR code
    const qr = await client.sessions.getQR(session.data.id);
    console.log('Scan this QR code:', qr.data.qrCode);
    
    // 3. Wait for connection (polling)
    await waitForConnection(session.data.id);
    
    // 4. Send message
    const message = await client.messages.sendText({
      sessionId: session.data.id,
      to: '1234567890',
      message: 'Hello from my website!'
    });
    
    console.log('Message sent:', message);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Helper function to wait for connection
async function waitForConnection(sessionId) {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const session = await client.sessions.get(sessionId);
        if (session.data.status === 'connected') {
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

### Option B: Python SDK

#### **1. Install via pip**
```bash
pip install whatsapp-flow-api-sdk
```

#### **2. Basic Usage**
```python
from whatsapp_api import WhatsAppAPI
import time

# Initialize client
client = WhatsAppAPI(
    api_key="your-api-key-here",
    base_url="https://whatsapp-flow-i0e2.onrender.com/api/v1"
)

def connect_whatsapp():
    try:
        # 1. Create session
        session = client.sessions.create(name="Python Website Session")
        session_id = session['data']['id']
        
        # 2. Get QR code
        qr_data = client.sessions.get_qr_code(session_id)
        print(f"Scan this QR code: {qr_data['data']['qrCode']}")
        
        # 3. Wait for connection
        wait_for_connection(session_id)
        
        # 4. Send message
        message = client.messages.send_text(
            session_id=session_id,
            to="1234567890",
            message="Hello from Python!"
        )
        
        print(f"Message sent: {message}")
        
    except Exception as error:
        print(f"Error: {error}")

def wait_for_connection(session_id):
    while True:
        session = client.sessions.get(session_id)
        status = session['data']['status']
        
        if status == 'connected':
            print("WhatsApp connected!")
            break
        elif status == 'failed':
            raise Exception("Connection failed")
        
        time.sleep(2)  # Check every 2 seconds
```

### Option C: Direct REST API

#### **1. Get API Key**
```bash
curl -X POST https://whatsapp-flow-i0e2.onrender.com/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website API Key",
    "scopes": ["messages:read", "messages:write", "sessions:read", "sessions:write"]
  }'
```

#### **2. Create Session**
```bash
curl -X POST https://whatsapp-flow-i0e2.onrender.com/api/v1/sessions \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website Session"
  }'
```

#### **3. Get QR Code**
```bash
curl -X GET https://whatsapp-flow-i0e2.onrender.com/api/v1/sessions/{SESSION_ID}/qr \
  -H "X-API-Key: YOUR_API_KEY"
```

#### **4. Send Message**
```bash
curl -X POST https://whatsapp-flow-i0e2.onrender.com/api/v1/messages/send \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "SESSION_ID",
    "to": "1234567890",
    "type": "text",
    "content": "Hello from REST API!"
  }'
```

---

## 🔑 Authentication Methods

### Method 1: API Keys (Recommended for External Apps)
```javascript
const client = new WhatsAppAPI({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://whatsapp-flow-i0e2.onrender.com/api/v1'
});
```

### Method 2: JWT Tokens (For User-based Apps)
```javascript
const client = new WhatsAppAPI({
  token: 'your-jwt-token-here',
  baseUrl: 'https://whatsapp-flow-i0e2.onrender.com/api/v1'
});
```

---

## 🌍 Production Deployment URLs

### Backend API
- **Production**: `https://whatsapp-flow-i0e2.onrender.com/api/v1`
- **WebSocket**: `wss://whatsapp-flow-i0e2.onrender.com`

### Frontend Dashboard
- **Production**: `https://dist-eta-sooty.vercel.app`

---

## 📋 Next Steps

1. **Choose your SDK** (JavaScript, Python, or REST API)
2. **Get API credentials** from the dashboard
3. **Install the SDK** in your project
4. **Follow the basic usage example**
5. **Test with a simple message**

## 🔗 Additional Resources

- **API Documentation**: https://whatsapp-flow-i0e2.onrender.com/api/docs
- **Frontend Dashboard**: https://dist-eta-sooty.vercel.app
- **GitHub Repository**: Your repository link here

## 🔧 Framework-Specific Examples

### React.js Integration
```jsx
import React, { useState, useEffect } from 'react';
import WhatsAppAPI from 'whatsapp-api-sdk';

const WhatsAppIntegration = () => {
  const [client] = useState(() => new WhatsAppAPI({
    apiKey: process.env.REACT_APP_WHATSAPP_API_KEY,
    baseUrl: 'https://whatsapp-flow-i0e2.onrender.com/api/v1'
  }));

  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('disconnected');

  const connectWhatsApp = async () => {
    try {
      const session = await client.sessions.create({
        name: 'React App Session'
      });

      const qr = await client.sessions.getQR(session.data.id);
      setQrCode(qr.data.qrCode);

      // Poll for connection status
      const interval = setInterval(async () => {
        const sessionData = await client.sessions.get(session.data.id);
        setStatus(sessionData.data.status);

        if (sessionData.data.status === 'connected') {
          clearInterval(interval);
          setQrCode('');
        }
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>WhatsApp Integration</h2>
      <p>Status: {status}</p>

      {qrCode && (
        <div>
          <p>Scan this QR code with WhatsApp:</p>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
        </div>
      )}

      <button onClick={connectWhatsApp}>Connect WhatsApp</button>
    </div>
  );
};

export default WhatsAppIntegration;
```

### Express.js Backend
```javascript
const express = require('express');
const WhatsAppAPI = require('whatsapp-api-sdk');

const app = express();
app.use(express.json());

const client = new WhatsAppAPI({
  apiKey: process.env.WHATSAPP_API_KEY,
  baseUrl: 'https://whatsapp-flow-i0e2.onrender.com/api/v1'
});

// Endpoint to send WhatsApp message
app.post('/send-whatsapp', async (req, res) => {
  try {
    const { to, message, sessionId } = req.body;

    const result = await client.messages.sendText({
      sessionId,
      to,
      message
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### WordPress Plugin Integration
```php
<?php
// WordPress plugin example
class WhatsAppAPIPlugin {
    private $api_key;
    private $base_url = 'https://whatsapp-flow-i0e2.onrender.com/api/v1';

    public function __construct() {
        $this->api_key = get_option('whatsapp_api_key');
        add_action('wp_ajax_send_whatsapp', array($this, 'send_whatsapp_message'));
    }

    public function send_whatsapp_message() {
        $to = sanitize_text_field($_POST['to']);
        $message = sanitize_textarea_field($_POST['message']);
        $session_id = sanitize_text_field($_POST['session_id']);

        $response = wp_remote_post($this->base_url . '/messages/send', array(
            'headers' => array(
                'X-API-Key' => $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode(array(
                'session_id' => $session_id,
                'to' => $to,
                'type' => 'text',
                'content' => $message
            ))
        ));

        if (is_wp_error($response)) {
            wp_send_json_error('Failed to send message');
        } else {
            wp_send_json_success('Message sent successfully');
        }
    }
}

new WhatsAppAPIPlugin();
?>
```

## 💡 Pro Tips

- Use webhooks for real-time message notifications
- Implement proper error handling and retry logic
- Store session IDs securely for reuse
- Monitor API rate limits and usage
- Cache QR codes temporarily to avoid repeated API calls
- Use environment variables for API keys and URLs
