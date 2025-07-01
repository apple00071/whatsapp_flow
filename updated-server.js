const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: {
      connected: true,
      state: 'CONNECTED',
      message: 'Server is running'
    }
  });
});

// WhatsApp status endpoint
app.get('/api/whatsapp/status', (req, res) => {
  // Return format that matches what the frontend expects
  res.json({
    isConnected: false,
    hasQR: true,
    qrCode: null,
    state: 'DISCONNECTED'
  });
});

// QR code endpoint
app.get('/api/whatsapp/qr', async (req, res) => {
  try {
    // Generate a mock QR code for demonstration
    const qrData = 'https://whatsapp.com/connect/' + Date.now();
    const qrCodeImage = await qrcode.toDataURL(qrData);
    
    res.json({
      success: true,
      qrCode: qrCodeImage,
      expiry: Date.now() + 60000 // Expires in 1 minute
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication
  if (username === 'admin' && password === 'whatsapp123') {
    res.json({
      success: true,
      message: 'Authentication successful',
      token: 'mock-token-123456',
      user: { id: 1, username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

// Send message endpoint
app.post('/api/send', (req, res) => {
  const { number, message } = req.body;
  
  if (!number || !message) {
    return res.status(400).json({
      success: false,
      message: 'Number and message are required'
    });
  }
  
  console.log(`[MOCK] Sending message to ${number}: ${message}`);
  
  res.json({
    success: true,
    message: 'Message sent successfully',
    data: { id: `mock-${Date.now()}`, status: 'sent' }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple API Server is running on port ${PORT}`);
}); 