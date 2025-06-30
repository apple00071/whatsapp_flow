const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'whatsapp-api' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

// Handle QR code
client.on('qr', (qr) => {
  console.log('QR RECEIVED:');
  qrcode.generate(qr, { small: true });
});

// Handle authentication
client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('ready', () => {
  console.log('Client is ready!');
});

// Initialize client
client.initialize();

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: client.info || {},
    message: 'WhatsApp connection status retrieved successfully'
  });
});

app.post('/api/send', express.json(), async (req, res) => {
  try {
    const { number, message } = req.body;
    
    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message: 'Number and message are required'
      });
    }
    
    const sanitizedNumber = number.toString().replace(/[^\d]/g, '');
    const chat = await client.getChatById(sanitizedNumber + '@c.us');
    const response = await chat.sendMessage(message);
    
    return res.json({
      success: true,
      message: 'Message sent successfully',
      data: response
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 