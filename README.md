# WhatsApp Flow

A powerful WhatsApp messaging platform built with Next.js and WhatsApp Web.js.

## Features

- 🚀 Modern UI with Next.js and TailwindCSS
- 📱 WhatsApp Web integration
- 💬 Send individual messages
- 📊 Message history tracking
- 📁 Bulk message upload via CSV
- ⚙️ Configurable settings
- 🔄 Real-time connection status
- 🔒 Secure authentication with QR code

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- A WhatsApp account
- Chrome browser (for WhatsApp Web)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/apple00071/whatsapp_flow.git
cd whatsapp-flow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
# In one terminal, start the Next.js frontend
npm run dev

# In another terminal, start the WhatsApp server
npm run whatsapp
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Initial Setup

1. Start both the frontend and WhatsApp server
2. Open the application in your browser
3. Scan the QR code with your WhatsApp mobile app
4. Once connected, you can start sending messages

### Sending Messages

1. Navigate to the Messages page
2. Enter the recipient's phone number (with country code)
3. Type your message
4. Click "Send Message"

### Bulk Upload

1. Navigate to the Bulk Upload page
2. Prepare a CSV file with columns: `phone`, `message`
3. Upload the CSV file
4. Review the preview
5. Click "Send Messages" to start the bulk send

### Settings

Configure various aspects of the application:
- Browser launch timeout
- QR code timeout
- Retry attempts
- Message delay for bulk operations

## Project Structure

```
whatsapp-flow/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── bulk/        # Bulk upload page
│   │   ├── messages/    # Messages page
│   │   └── settings/    # Settings page
│   ├── components/      # React components
│   └── lib/            # Utility functions
├── public/             # Static files
├── server.js          # WhatsApp server
└── package.json       # Dependencies
```

## API Endpoints

### WhatsApp Server (http://localhost:3001)

- `GET /api/whatsapp/status` - Get connection status
- `POST /api/whatsapp/send` - Send a message
- `GET /api/whatsapp/messages` - Get message history

## Deployment

For production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## License

This project is licensed under the MIT License.

## Author

Apple Graphics 