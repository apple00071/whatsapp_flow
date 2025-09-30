# WhatsApp Platform SDK for Node.js

Official Node.js SDK for the WhatsApp Programmable Messaging Platform.

## Installation

```bash
npm install @whatsapp-platform/sdk
```

## Quick Start

```javascript
const WhatsAppAPI = require('@whatsapp-platform/sdk');

// Initialize the client
const client = new WhatsAppAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.yourplatform.com' // Optional, defaults to production URL
});

// Send a text message
async function sendMessage() {
  try {
    const result = await client.messages.sendText({
      sessionId: 'your-session-id',
      to: '1234567890',
      message: 'Hello from WhatsApp API!'
    });
    
    console.log('Message sent:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

sendMessage();
```

## Configuration

### Options

- `apiKey` (required): Your API key from the platform
- `baseUrl` (optional): Base URL of the API (default: production URL)
- `timeout` (optional): Request timeout in milliseconds (default: 30000)
- `maxRetries` (optional): Maximum number of retry attempts (default: 3)

```javascript
const client = new WhatsAppAPI({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000',
  timeout: 60000,
  maxRetries: 5
});
```

## Sessions

### Create a Session

```javascript
const session = await client.sessions.create({
  name: 'My WhatsApp Session'
});

console.log('Session ID:', session.data.id);
```

### Get QR Code

```javascript
const qr = await client.sessions.getQR('session-id');
console.log('QR Code:', qr.data.qrCode);
```

### List Sessions

```javascript
const sessions = await client.sessions.list();
console.log('Sessions:', sessions.data);
```

### Get Session Details

```javascript
const session = await client.sessions.get('session-id');
console.log('Session:', session.data);
```

### Delete Session

```javascript
await client.sessions.delete('session-id');
console.log('Session deleted');
```

## Messages

### Send Text Message

```javascript
const message = await client.messages.sendText({
  sessionId: 'session-id',
  to: '1234567890',
  message: 'Hello, World!'
});

console.log('Message ID:', message.data.id);
```

### Send Image

```javascript
const message = await client.messages.sendMedia({
  sessionId: 'session-id',
  to: '1234567890',
  type: 'image',
  mediaUrl: 'https://example.com/image.jpg',
  caption: 'Check out this image!'
});
```

### Send Local File

```javascript
const message = await client.messages.sendMedia({
  sessionId: 'session-id',
  to: '1234567890',
  type: 'document',
  mediaUrl: './path/to/document.pdf',
  caption: 'Here is the document'
});
```

### Send Location

```javascript
const message = await client.messages.sendLocation({
  sessionId: 'session-id',
  to: '1234567890',
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'San Francisco',
  address: 'San Francisco, CA, USA'
});
```

### Get Message History

```javascript
const messages = await client.messages.list({
  sessionId: 'session-id',
  page: 1,
  limit: 50
});

console.log('Messages:', messages.data);
```

### Get Message Status

```javascript
const status = await client.messages.getStatus('message-id');
console.log('Status:', status.data.status);
```

## Contacts

### List Contacts

```javascript
const contacts = await client.contacts.list({
  sessionId: 'session-id'
});

console.log('Contacts:', contacts.data);
```

### Create Contact

```javascript
const contact = await client.contacts.create({
  sessionId: 'session-id',
  phone_number: '1234567890',
  name: 'John Doe'
});
```

### Update Contact

```javascript
const contact = await client.contacts.update('contact-id', {
  name: 'Jane Doe',
  notes: 'Important client'
});
```

### Delete Contact

```javascript
await client.contacts.delete('contact-id');
```

## Groups

### List Groups

```javascript
const groups = await client.groups.list({
  sessionId: 'session-id'
});

console.log('Groups:', groups.data);
```

### Get Group Details

```javascript
const group = await client.groups.get('group-id');
console.log('Group:', group.data);
```

## Webhooks

### Create Webhook

```javascript
const webhook = await client.webhooks.create({
  url: 'https://your-server.com/webhook',
  events: ['message.received', 'message.status'],
  sessionId: 'session-id' // Optional: for session-specific webhooks
});

console.log('Webhook ID:', webhook.data.id);
```

### List Webhooks

```javascript
const webhooks = await client.webhooks.list();
console.log('Webhooks:', webhooks.data);
```

### Delete Webhook

```javascript
await client.webhooks.delete('webhook-id');
```

## Error Handling

The SDK throws errors with the following structure:

```javascript
try {
  await client.messages.sendText({
    sessionId: 'invalid-session',
    to: '1234567890',
    message: 'Test'
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('Status Code:', error.statusCode);
  console.error('Details:', error.details);
}
```

## Retry Logic

The SDK automatically retries failed requests with exponential backoff for:
- Network errors
- Server errors (5xx)
- Rate limit errors (429)

You can configure the maximum number of retries:

```javascript
const client = new WhatsAppAPI({
  apiKey: 'your-api-key',
  maxRetries: 5 // Default is 3
});
```

## TypeScript Support

The SDK includes TypeScript definitions:

```typescript
import WhatsAppAPI from '@whatsapp-platform/sdk';

const client = new WhatsAppAPI({
  apiKey: 'your-api-key'
});

// TypeScript will provide autocomplete and type checking
const message = await client.messages.sendText({
  sessionId: 'session-id',
  to: '1234567890',
  message: 'Hello!'
});
```

## Examples

See the [examples](./examples) directory for complete example applications:

- [Basic Message Sending](./examples/basic-messaging.js)
- [Webhook Integration](./examples/webhook-server.js)
- [Bulk Messaging](./examples/bulk-messaging.js)
- [Express.js Integration](./examples/express-integration.js)

## Support

- **Documentation**: https://docs.yourplatform.com
- **Issues**: https://github.com/yourusername/whatsapp-api-platform/issues
- **Email**: support@yourplatform.com

## License

MIT

