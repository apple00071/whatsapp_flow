# WhatsApp API Platform - Python SDK

Official Python SDK for the WhatsApp API Platform.

## Installation

```bash
pip install whatsapp-api-platform
```

Or install from source:

```bash
git clone https://github.com/whatsapp-api-platform/python-sdk.git
cd python-sdk
pip install -e .
```

## Quick Start

```python
from whatsapp_api import WhatsAppAPI

# Initialize client
client = WhatsAppAPI(
    api_key="your-api-key",
    base_url="http://localhost:3000/api/v1"
)

# Create a session
session = client.sessions.create(name="My Session")
print(f"Session created: {session['data']['id']}")

# Get QR code
qr = client.sessions.get_qr_code(session['data']['id'])
print(f"QR Code: {qr['data']['qr']}")

# Send a text message
message = client.messages.send_text(
    session_id=session['data']['id'],
    to="1234567890",
    message="Hello from Python SDK!"
)
print(f"Message sent: {message['data']['id']}")
```

## Features

- ✅ Session management (create, list, delete, reconnect)
- ✅ Send messages (text, media, location)
- ✅ Contact management (CRUD, sync)
- ✅ Group management (CRUD, participants)
- ✅ Webhook management
- ✅ Automatic retry with exponential backoff
- ✅ Comprehensive error handling
- ✅ Type hints for better IDE support

## Usage Examples

### Sessions

```python
# List sessions
sessions = client.sessions.list(page=1, limit=20)

# Get session
session = client.sessions.get("session-id")

# Update session
updated = client.sessions.update("session-id", name="New Name")

# Delete session
client.sessions.delete("session-id")

# Reconnect session
client.sessions.reconnect("session-id")
```

### Messages

```python
# Send text message
client.messages.send_text(
    session_id="session-id",
    to="1234567890",
    message="Hello!"
)

# Send media
client.messages.send_media(
    session_id="session-id",
    to="1234567890",
    file_path="/path/to/image.jpg",
    caption="Check this out!"
)

# Send location
client.messages.send_location(
    session_id="session-id",
    to="1234567890",
    latitude=37.7749,
    longitude=-122.4194,
    name="San Francisco"
)

# List messages
messages = client.messages.list(session_id="session-id", page=1, limit=50)

# Get message status
status = client.messages.get_status("message-id")
```

### Contacts

```python
# List contacts
contacts = client.contacts.list(session_id="session-id")

# Create contact
contact = client.contacts.create(
    session_id="session-id",
    phone="1234567890",
    name="John Doe",
    email="john@example.com"
)

# Update contact
client.contacts.update("contact-id", name="Jane Doe")

# Delete contact
client.contacts.delete("contact-id")

# Sync contacts from WhatsApp
client.contacts.sync("session-id")
```

### Groups

```python
# List groups
groups = client.groups.list(session_id="session-id")

# Create group
group = client.groups.create(
    session_id="session-id",
    name="My Group",
    participants=["1234567890", "0987654321"]
)

# Add participants
client.groups.add_participants(
    group_id="group-id",
    participants=["1111111111"]
)

# Remove participants
client.groups.remove_participants(
    group_id="group-id",
    participants=["1111111111"]
)

# Leave group
client.groups.leave("group-id")

# Sync groups from WhatsApp
client.groups.sync("session-id")
```

### Webhooks

```python
# List webhooks
webhooks = client.webhooks.list()

# Create webhook
webhook = client.webhooks.create(
    url="https://example.com/webhook",
    events=["message:received", "session:status"]
)

# Update webhook
client.webhooks.update(
    webhook_id="webhook-id",
    events=["message:received"]
)

# Test webhook
client.webhooks.test("webhook-id")

# Get webhook logs
logs = client.webhooks.get_logs("webhook-id", page=1, limit=50)

# Delete webhook
client.webhooks.delete("webhook-id")
```

## Error Handling

```python
from whatsapp_api import WhatsAppAPI, WhatsAppAPIError, AuthenticationError

client = WhatsAppAPI(api_key="your-api-key")

try:
    session = client.sessions.create(name="My Session")
except AuthenticationError as e:
    print(f"Authentication failed: {e.message}")
except WhatsAppAPIError as e:
    print(f"API error: {e.message} (status: {e.status_code})")
```

## Configuration

```python
client = WhatsAppAPI(
    api_key="your-api-key",
    base_url="http://localhost:3000/api/v1",  # API base URL
    timeout=30,  # Request timeout in seconds
    max_retries=3  # Maximum number of retries
)
```

## Requirements

- Python 3.7+
- requests >= 2.28.0

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black whatsapp_api

# Lint code
flake8 whatsapp_api
```

## License

MIT License - see LICENSE file for details

## Support

- Documentation: https://docs.whatsapp-api.com
- Issues: https://github.com/whatsapp-api-platform/python-sdk/issues
- Email: support@whatsapp-api.com

