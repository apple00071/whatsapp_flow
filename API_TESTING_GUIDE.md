# API Testing Guide

This guide provides ready-to-use curl commands and examples for testing the WhatsApp API Platform.

## 🚀 Quick Setup

```bash
# Set base URL
export API_URL="http://localhost:3000/api/v1"

# These will be set after registration/login
export TOKEN=""
export API_KEY=""
export SESSION_ID=""
```

## 1️⃣ Authentication

### Register a New User

```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "7d"
  }
}
```

**Save the token:**
```bash
export TOKEN="<your-access-token>"
```

### Login

```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Refresh Token

```bash
curl -X POST $API_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your-refresh-token>"
  }'
```

### Logout

```bash
curl -X POST $API_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Change Password

```bash
curl -X PUT $API_URL/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

## 2️⃣ Sessions

### Create a Session

```bash
curl -X POST $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My WhatsApp Session"
  }'
```

**Save the session ID:**
```bash
export SESSION_ID="<your-session-id>"
```

### List All Sessions

```bash
curl -X GET "$API_URL/sessions?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Session Details

```bash
curl -X GET $API_URL/sessions/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Get QR Code

```bash
curl -X GET $API_URL/sessions/$SESSION_ID/qr \
  -H "Authorization: Bearer $TOKEN"
```

**The response will include a base64 QR code. Scan it with WhatsApp!**

### Update Session

```bash
curl -X PUT $API_URL/sessions/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Session Name",
    "webhook_url": "https://your-server.com/webhook",
    "webhook_events": ["message.received", "message.status"]
  }'
```

### Reconnect Session

```bash
curl -X POST $API_URL/sessions/$SESSION_ID/reconnect \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Session

```bash
curl -X DELETE $API_URL/sessions/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 3️⃣ Messages

### Send Text Message

```bash
curl -X POST $API_URL/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "content": "Hello from WhatsApp API! 🚀"
  }'
```

### Send Image

```bash
curl -X POST $API_URL/messages/media \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "type": "image",
    "media_url": "https://picsum.photos/800/600",
    "caption": "Check out this image! 📸"
  }'
```

### Send Document

```bash
curl -X POST $API_URL/messages/media \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "type": "document",
    "media_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "caption": "Here is the document"
  }'
```

### Send Location

```bash
curl -X POST $API_URL/messages/location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "name": "San Francisco",
      "address": "San Francisco, CA, USA"
    }
  }'
```

### Get Message History

```bash
# All messages
curl -X GET "$API_URL/messages?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Filter by session
curl -X GET "$API_URL/messages?session_id=$SESSION_ID&page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Filter by direction
curl -X GET "$API_URL/messages?direction=outbound&page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Filter by type
curl -X GET "$API_URL/messages?type=text&page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "$API_URL/messages?status=delivered&page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Message Details

```bash
curl -X GET $API_URL/messages/<message-id> \
  -H "Authorization: Bearer $TOKEN"
```

### Get Message Status

```bash
curl -X GET $API_URL/messages/<message-id>/status \
  -H "Authorization: Bearer $TOKEN"
```

## 4️⃣ Health & Monitoring

### Basic Health Check

```bash
curl -X GET $API_URL/health
```

### Detailed Health Check

```bash
curl -X GET $API_URL/health/detailed
```

### Prometheus Metrics

```bash
curl -X GET $API_URL/health/metrics
```

## 5️⃣ Using API Keys

### Generate API Key (requires JWT token)

```bash
curl -X POST $API_URL/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Application",
    "scopes": ["messages:read", "messages:write", "sessions:read", "sessions:write"]
  }'
```

**Save the API key (shown only once!):**
```bash
export API_KEY="sk_..."
```

### Use API Key for Authentication

```bash
# Send message with API key instead of JWT
curl -X POST $API_URL/messages/send \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "'$SESSION_ID'",
    "to": "1234567890",
    "content": "Message sent with API key!"
  }'
```

## 🧪 Testing Scenarios

### Scenario 1: Complete Flow

```bash
# 1. Register
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","first_name":"John","last_name":"Doe"}'

# 2. Save token
export TOKEN="<token-from-response>"

# 3. Create session
curl -X POST $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Session"}'

# 4. Save session ID
export SESSION_ID="<session-id-from-response>"

# 5. Get QR code
curl -X GET $API_URL/sessions/$SESSION_ID/qr \
  -H "Authorization: Bearer $TOKEN"

# 6. Scan QR code with WhatsApp

# 7. Send message
curl -X POST $API_URL/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"'$SESSION_ID'","to":"1234567890","content":"Hello!"}'
```

### Scenario 2: Error Handling

```bash
# Test invalid token
curl -X GET $API_URL/sessions \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized

# Test missing required field
curl -X POST $API_URL/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"'$SESSION_ID'"}'

# Expected: 400 Validation Error

# Test non-existent resource
curl -X GET $API_URL/sessions/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
```

### Scenario 3: Rate Limiting

```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl -X GET $API_URL/sessions \
    -H "Authorization: Bearer $TOKEN"
done

# After exceeding limit, expect: 429 Too Many Requests
```

## 📊 Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation error",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 🔍 Debugging Tips

### View Request/Response Headers

```bash
curl -v -X GET $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN"
```

### Pretty Print JSON Response

```bash
curl -X GET $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Save Response to File

```bash
curl -X GET $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -o sessions.json
```

### Test with Different Content Types

```bash
# JSON (default)
curl -X POST $API_URL/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"'$SESSION_ID'","to":"1234567890","content":"Hello"}'
```

## 📝 Notes

- Replace `<placeholders>` with actual values
- All timestamps are in ISO 8601 format
- Phone numbers should be in international format without '+'
- Session must be connected before sending messages
- Rate limits apply per endpoint and authentication method

## 🆘 Common Issues

### "Session not connected"
- Make sure you scanned the QR code
- Check session status: `GET /sessions/:id`
- Try reconnecting: `POST /sessions/:id/reconnect`

### "Invalid token"
- Token might be expired
- Get a new token with `/auth/refresh`
- Or login again with `/auth/login`

### "Rate limit exceeded"
- Wait for the rate limit window to reset
- Check headers for `X-RateLimit-Reset`
- Consider using a different API key

---

For more information, see the [API Documentation](http://localhost:3000/api/docs) or [QUICK_START.md](./QUICK_START.md).

