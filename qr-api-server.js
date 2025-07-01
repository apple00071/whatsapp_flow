const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const axios = require('axios');

const app = express();
const PORT = 3003;

// Configure CORS with more options
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Add headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Middleware to parse JSON
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    message: 'QR API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get WhatsApp status from main server
async function getWhatsAppStatus() {
  try {
    const response = await axios.get('http://localhost:3002/api/whatsapp/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching WhatsApp status:', error.message);
    return null;
  }
}

// QR code endpoint
app.get('/api/whatsapp/qr', async (req, res) => {
  try {
    // Get status from main server
    const status = await getWhatsAppStatus();
    
    if (!status || !status.qrCode) {
      // If no QR code is available, generate a mock one
      console.log('No QR code available from main server, generating mock');
      
      // Generate a mock QR code for testing
      const qrData = 'https://whatsapp.com/connect/' + Date.now();
      const mockQRCode = await qrcode.toDataURL(qrData);
      
      return res.json({
        success: true,
        qrCode: mockQRCode,
        isMock: true,
        expiry: Date.now() + 60000 // Expires in 1 minute
      });
    }
    
    // Return the QR code from the main server
    res.json({
      success: true,
      qrCode: status.qrCode,
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

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`QR API Server is running on port ${PORT}`);
  console.log(`Access the QR code at: http://YOUR_SERVER_IP:${PORT}/api/whatsapp/qr`);
}); 