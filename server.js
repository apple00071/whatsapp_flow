const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Import message queue and rate limiter
const { messageQueue, bulkMessageQueue, queueMessage, queueBulkMessages } = require('./src/lib/messageQueue');
const { consumeRateLimits } = require('./src/lib/rateLimiter');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-flow-secret-key';
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || ['https://whatsapp-flow-psi.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
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

// Global state variables
let client = null;
let qrCode = null;
let qrCodeDataURL = null;
let isConnected = false;
let initializationInProgress = false;

// Make the client globally accessible
global.whatsappClient = null;

const messagesFile = path.join(__dirname, 'data', 'messages.json');

// Templates endpoints
const templatesFile = path.join(__dirname, 'data', 'templates.json');

// Users file for authentication
const usersFile = path.join(__dirname, 'data', 'users.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.promises.access(dataDir);
  } catch {
    await fs.promises.mkdir(dataDir, { recursive: true });
  }
}

// Load messages from file
async function loadMessages() {
    await ensureDataDirectory();
    
    try {
      await fs.promises.access(messagesFile);
    const data = await fs.promises.readFile(messagesFile, 'utf8');
    return JSON.parse(data);
    } catch {
    return [];
  }
}

// Save message to file
async function saveMessage(message) {
  try {
    const messages = await loadMessages();
    messages.push(message);
    await fs.promises.writeFile(messagesFile, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

// Load templates from file
async function loadTemplates() {
    await ensureDataDirectory();
    
    try {
      await fs.promises.access(templatesFile);
    const data = await fs.promises.readFile(templatesFile, 'utf8');
    return JSON.parse(data);
    } catch {
    return [];
  }
}

  // Save template to file
  async function saveTemplate(template) {
  try {
      const templates = await loadTemplates();
      templates.push(template);
    await fs.promises.writeFile(templatesFile, JSON.stringify(templates, null, 2));
  } catch (error) {
      console.error('Error saving template:', error);
  }
}

  // Load users from file
  async function loadUsers() {
    await ensureDataDirectory();
    
    try {
      await fs.promises.access(usersFile);
      const data = await fs.promises.readFile(usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, create default admin user
      const defaultUsers = [
        {
          id: '1',
          email: 'applegraphicshyd@gmail.com',
          password: 'Admin@123456', // In production, use hashed passwords
          name: 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      
      await fs.promises.writeFile(usersFile, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
  }
}

  // Clear session files
async function clearSession() {
    const sessionDir = path.join(__dirname, '.wwebjs_auth', 'session-whatsapp-flow');
  try {
    if (fs.existsSync(sessionDir)) {
      await fs.promises.rm(sessionDir, { recursive: true, force: true });
        console.log('Session files cleared');
    }
  } catch (error) {
      console.error('Error clearing session files:', error);
  }
}

// Initialize WhatsApp client
async function initializeClient() {
  if (initializationInProgress) {
    console.log('Client initialization already in progress...');
    return;
  }

  try {
    initializationInProgress = true;
    console.log('Initializing WhatsApp client...');

    // Clear session files
    const sessionDir = path.join(__dirname, '.wwebjs_auth/session-whatsapp-flow');
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      console.log('Session files cleared');
    }

    // Initialize new client
    client = new Client({
      authStrategy: new LocalAuth({ clientId: 'whatsapp-flow' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // QR Code event
    client.on('qr', async (qr) => {
      console.log('QR Code received');
      qrCode = qr;
      try {
        qrCodeDataURL = await qrcode.toDataURL(qr);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    });

    // Ready event
    client.on('ready', () => {
      console.log('Client is ready!');
      isConnected = true;
      global.whatsappClient = client;
    });

    // Disconnected event
    client.on('disconnected', (reason) => {
      console.log('Client was disconnected:', reason);
      isConnected = false;
      global.whatsappClient = null;
      initializationInProgress = false;
      
      // Attempt to reinitialize after a delay
      setTimeout(() => {
          initializeClient();
      }, 5000);
    });

    // Initialize the client
    await client.initialize();
    console.log('Client initialized successfully');
  } catch (error) {
    console.error('Error initializing client:', error);
    initializationInProgress = false;
    
    // Attempt to reinitialize after a delay
    setTimeout(() => {
        initializeClient();
    }, 5000);
  }
}

// API Routes
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    isConnected,
    hasQR: !!qrCodeDataURL,
    qrCode: qrCodeDataURL,
    state: isConnected ? 'CONNECTED' : (qrCodeDataURL ? 'REQUIRE_QR' : 'DISCONNECTED')
  });
});

app.post('/api/whatsapp/messages', async (req, res) => {
  if (!isConnected) {
    return res.status(400).json({ success: false, error: 'WhatsApp is not connected' });
  }

  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Phone and message are required' });
  }

  try {
    await queueMessage(phone, message);
    res.json({ success: true, message: 'Message queued successfully' });
  } catch (error) {
    console.error('Error queueing message:', error);
    res.status(500).json({ success: false, error: 'Failed to queue message' });
  }
});

app.post('/api/whatsapp/bulk', async (req, res) => {
      if (!isConnected) {
    return res.status(400).json({ success: false, error: 'WhatsApp is not connected' });
    }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    try {
    await queueBulkMessages(messages);
    res.json({ success: true, message: 'Bulk messages queued successfully' });
  } catch (error) {
    console.error('Error queueing bulk messages:', error);
    res.status(500).json({ success: false, error: 'Failed to queue bulk messages' });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    if (client) {
      await client.destroy();
      client = null;
      global.whatsappClient = null;
      isConnected = false;
      qrCode = null;
      qrCodeDataURL = null;
      initializationInProgress = false;
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ success: false, error: 'Failed to logout' });
  }
});

app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    if (client) {
      await client.destroy();
    client = null;
      global.whatsappClient = null;
    isConnected = false;
    qrCode = null;
    qrCodeDataURL = null;
    initializationInProgress = false;
    }
    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error during disconnect:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect' });
  }
});

// Templates endpoints
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await loadTemplates();
      res.json(templates);
  } catch (error) {
      console.error('Error loading templates:', error);
      res.status(500).json({ error: 'Failed to load templates' });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const { name, content, category } = req.body;

    if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
    }

      const template = {
      id: Date.now().toString(),
      name,
      content,
      category: category || 'General',
        createdAt: new Date().toISOString()
    };

      await saveTemplate(template);
      res.status(201).json(template);
  } catch (error) {
      console.error('Error saving template:', error);
      res.status(500).json({ error: 'Failed to save template' });
  }
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