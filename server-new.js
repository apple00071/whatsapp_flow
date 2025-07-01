const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Create a simple WhatsApp client directly in this file
const whatsappClient = {
  isReady: false,
  sendMessage: async (phoneNumber, message) => {
    console.log(`[MOCK] Sending message to ${phoneNumber}: ${message}`);
    return { id: `mock-${Date.now()}`, status: 'sent' };
  },
  getStatus: () => {
    return {
      connected: true,
      state: 'CONNECTED',
      message: 'WhatsApp client is ready'
    };
  },
  setReady: (status) => {
    whatsappClient.isReady = status;
  }
};

const PORT = process.env.PORT || 3002; // Using port 3002 instead of 3001
const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-flow-secret-key';
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Initialize WhatsApp client
const initializeClient = () => {
  console.log('Initializing WhatsApp client...');
  whatsappClient.setReady(true);
};

// Status endpoint
app.get('/api/status', (req, res) => {
  const status = whatsappClient.getStatus();
  res.json({ success: true, status });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication
  if (username === 'admin' && password === 'whatsapp123') {
    const user = { id: 1, username: 'admin', role: 'admin' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

// Send message endpoint
app.post('/api/send', authenticateToken, async (req, res) => {
  try {
    const { number, message } = req.body;
    
    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message: 'Number and message are required'
      });
    }
    
    const result = await whatsappClient.sendMessage(number, message);
    
    return res.json({
      success: true,
      message: 'Message sent successfully',
      data: result
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

// WhatsApp status endpoint
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    success: true,
    status: {
      connected: true,
      state: 'CONNECTED',
      message: 'WhatsApp client is ready'
    }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log(`WhatsApp API Server is running on port ${PORT}`);
  
  // Initialize WhatsApp client
  initializeClient();
}); 