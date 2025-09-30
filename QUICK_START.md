# Quick Start Guide - WhatsApp API Platform

Get up and running with the WhatsApp Programmable Messaging Platform in minutes.

## 🚀 5-Minute Setup

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd whatsapp-api-platform

# 2. Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Edit server/.env with your settings (minimum required):
# - JWT_SECRET=your-random-secret-key-min-32-characters
# - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/whatsapp_api

# 4. Start everything with Docker
docker-compose up -d

# 5. Check if services are running
docker-compose ps

# 6. View logs
docker-compose logs -f server
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050

### Option 2: Manual Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Start PostgreSQL and Redis
docker-compose up -d postgres redis

# 3. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# 4. Start backend (Terminal 1)
cd server
npm run dev

# 5. Start frontend (Terminal 2)
cd client
npm run dev
```

## 📱 First Steps

### 1. Create an Account

**Using the API:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "your@email.com",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "7d"
  }
}
```

### 2. Create a WhatsApp Session

```bash
# Save your access token
TOKEN="your-access-token-from-registration"

# Create a session
curl -X POST http://localhost:3000/api/v1/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Session"
  }'
```

### 3. Get QR Code

```bash
# Get the session ID from previous response
SESSION_ID="your-session-id"

# Get QR code
curl http://localhost:3000/api/v1/sessions/$SESSION_ID/qr \
  -H "Authorization: Bearer $TOKEN"
```

**Scan the QR code with WhatsApp on your phone!**

### 4. Send Your First Message

```bash
# After scanning QR code and session is connected
curl -X POST http://localhost:3000/api/v1/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "type": "text",
    "content": "Hello from WhatsApp API! 🚀"
  }'
```

## 🔑 Using API Keys (for External Applications)

### 1. Generate an API Key

```bash
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Application",
    "scopes": ["messages:read", "messages:write", "sessions:read"]
  }'
```

**Save the API key - it's only shown once!**

### 2. Use API Key for Authentication

```bash
# Use X-API-Key header instead of Bearer token
API_KEY="sk_your-api-key"

curl -X POST http://localhost:3000/api/v1/messages/send \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "type": "text",
    "content": "Message sent with API key!"
  }'
```

## 📚 Using the Node.js SDK

### 1. Install SDK

```bash
npm install @whatsapp-platform/sdk
```

### 2. Basic Usage

```javascript
const WhatsAppAPI = require('@whatsapp-platform/sdk');

// Initialize client
const client = new WhatsAppAPI({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000'
});

// Create session
const session = await client.sessions.create({
  name: 'My Session'
});

// Get QR code
const qr = await client.sessions.getQR(session.data.id);
console.log('Scan this QR code:', qr.data.qrCode);

// Send message (after scanning QR)
const message = await client.messages.sendText({
  sessionId: session.data.id,
  to: '1234567890',
  message: 'Hello from SDK!'
});

console.log('Message sent:', message.data.id);
```

## 🔔 Setting Up Webhooks

### 1. Create a Webhook Endpoint

```javascript
// webhook-server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const event = req.headers['x-webhook-event'];
  const data = req.body.data;
  
  console.log('Received event:', event, data);
  
  // Process the event
  if (event === 'message.received') {
    console.log('New message from:', data.from);
    console.log('Content:', data.body);
  }
  
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});
```

### 2. Register Webhook

```bash
curl -X POST http://localhost:3000/api/v1/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://your-server.com:3001/webhook",
    "events": ["message.received", "message.status"],
    "session_id": "'$SESSION_ID'"
  }'
```

## 🧪 Testing the API

### Using the Interactive API Docs

1. Open http://localhost:3000/api/docs
2. Click "Authorize" button
3. Enter your Bearer token or API key
4. Try out any endpoint directly from the browser!

### Using Postman

1. Import the OpenAPI spec from http://localhost:3000/api/docs/swagger.json
2. Set up environment variables:
   - `base_url`: http://localhost:3000/api/v1
   - `token`: your-access-token
3. Start making requests!

## 📊 Monitoring

### Health Check

```bash
# Basic health
curl http://localhost:3000/api/v1/health

# Detailed health with service status
curl http://localhost:3000/api/v1/health/detailed

# Prometheus metrics
curl http://localhost:3000/api/v1/health/metrics
```

### View Logs

```bash
# Docker logs
docker-compose logs -f server

# Or check log files
tail -f server/logs/combined.log
tail -f server/logs/error.log
```

### Database Management

Access pgAdmin at http://localhost:5050:
- Email: admin@admin.com
- Password: admin

Add server:
- Host: postgres
- Port: 5432
- Database: whatsapp_api
- Username: postgres
- Password: postgres

## 🔧 Common Tasks

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Update Dependencies

```bash
cd server && npm update
cd ../client && npm update
```

### Run Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# E2E tests
cd client && npm run test:e2e
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### WhatsApp Session Not Connecting

1. Make sure you scanned the QR code within 60 seconds
2. Check if your phone has internet connection
3. Try creating a new session
4. Check server logs for errors

### API Returns 401 Unauthorized

1. Check if your token is valid
2. Make sure you're using the correct header:
   - JWT: `Authorization: Bearer <token>`
   - API Key: `X-API-Key: <key>`
3. Token might be expired - get a new one

## 📖 Next Steps

1. **Explore the API Documentation**: http://localhost:3000/api/docs
2. **Read the Complete Guide**: See [PROJECT_COMPLETION_GUIDE.md](./PROJECT_COMPLETION_GUIDE.md)
3. **Check Implementation Status**: See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
4. **Try the SDK Examples**: See [sdks/nodejs-sdk/examples/](./sdks/nodejs-sdk/examples/)
5. **Build Your Application**: Start integrating WhatsApp into your app!

## 💡 Example Use Cases

### Customer Support Bot

```javascript
// Auto-reply to customer messages
client.webhooks.create({
  url: 'https://your-server.com/support-webhook',
  events: ['message.received']
});

// In your webhook handler:
if (message.body.toLowerCase().includes('help')) {
  await client.messages.sendText({
    sessionId: sessionId,
    to: message.from,
    message: 'How can I help you today? Type:\n1. Order Status\n2. Returns\n3. Contact Support'
  });
}
```

### Notification System

```javascript
// Send order confirmation
async function sendOrderConfirmation(phoneNumber, orderDetails) {
  await client.messages.sendText({
    sessionId: sessionId,
    to: phoneNumber,
    message: `Order Confirmed! 🎉\n\nOrder #${orderDetails.id}\nTotal: $${orderDetails.total}\n\nTrack your order: ${orderDetails.trackingUrl}`
  });
}
```

### Bulk Messaging

```javascript
// Send promotional messages
const customers = ['1234567890', '0987654321', ...];

for (const customer of customers) {
  await client.messages.sendText({
    sessionId: sessionId,
    to: customer,
    message: '🎉 Special Offer! Get 20% off your next purchase. Use code: SAVE20'
  });
  
  // Rate limiting - wait 1 second between messages
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

## 🆘 Getting Help

- **Documentation**: Check the `/docs` directory
- **API Docs**: http://localhost:3000/api/docs
- **Issues**: Create an issue on GitHub
- **Community**: Join our Discord/Slack (if available)

---

**Happy Coding! 🚀**

For more detailed information, see the [main README](./README.md) and [PROJECT_COMPLETION_GUIDE](./PROJECT_COMPLETION_GUIDE.md).

