"""
WhatsApp API Platform - Python SDK
Basic usage example
"""

from whatsapp_api import WhatsAppAPI

# Initialize client
client = WhatsAppAPI(
    api_key="your-api-key-here",
    base_url="http://localhost:3000/api/v1"
)

def main():
    print("WhatsApp API Platform - Python SDK Example\n")

    # 1. Create a session
    print("1. Creating session...")
    session = client.sessions.create(name="Python SDK Session")
    session_id = session['data']['id']
    print(f"   Session created: {session_id}\n")

    # 2. Get QR code
    print("2. Getting QR code...")
    qr_data = client.sessions.get_qr_code(session_id)
    print(f"   QR Code: {qr_data['data']['qr']}")
    print("   Scan this QR code with WhatsApp to connect\n")

    # Wait for user to scan QR code
    input("Press Enter after scanning the QR code...")

    # 3. Send a text message
    print("\n3. Sending text message...")
    message = client.messages.send_text(
        session_id=session_id,
        to="1234567890",  # Replace with actual phone number
        message="Hello from WhatsApp API Python SDK! 🚀"
    )
    print(f"   Message sent: {message['data']['id']}\n")

    # 4. List messages
    print("4. Listing messages...")
    messages = client.messages.list(session_id=session_id, limit=10)
    print(f"   Total messages: {messages['data']['pagination']['total']}\n")

    # 5. Sync contacts
    print("5. Syncing contacts from WhatsApp...")
    contacts_result = client.contacts.sync(session_id)
    print(f"   Synced {len(contacts_result['data']['contacts'])} contacts\n")

    # 6. List contacts
    print("6. Listing contacts...")
    contacts = client.contacts.list(session_id=session_id, limit=10)
    print(f"   Total contacts: {contacts['data']['pagination']['total']}\n")

    # 7. Create a webhook
    print("7. Creating webhook...")
    webhook = client.webhooks.create(
        url="https://example.com/webhook",
        events=["message:received", "session:status"]
    )
    print(f"   Webhook created: {webhook['data']['id']}\n")

    print("Example completed successfully!")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")

