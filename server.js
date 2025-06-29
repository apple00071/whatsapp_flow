const express = require('express');
const http = require('http');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const next = require('next');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Import the message queue and rate limiter
const { messageQueue, bulkMessageQueue, queueMessage, queueBulkMessages } = require('./src/lib/messageQueue');
const { consumeRateLimits } = require('./src/lib/rateLimiter');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-flow-secret-key';

// Prepare Next.js
app.prepare().then(() => {
  const server = express();

  // Security middleware
  server.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Next.js compatibility
    crossOriginEmbedderPolicy: false, // Needed for Next.js
  }));
  
  // CORS configuration
  server.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  }));

  // Body parser middleware
  server.use(express.json());
  
  // API rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, error: 'Too many requests, please try again later' }
});

  // Apply rate limiting to API routes
  server.use('/api/', apiLimiter);

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
    console.log('Client initialization already in progress');
    return;
  }

  try {
    initializationInProgress = true;
    isConnected = false;
    qrCode = null;
    qrCodeDataURL = null;

    // Clear any existing client
    if (client) {
      console.log('Destroying existing client...');
      try {
        await client.destroy();
      } catch (error) {
        console.error('Error destroying client:', error);
      }
      client = null;
      // Add a delay after destroying the client
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Clear any existing session
    await clearSession();

    console.log('Initializing WhatsApp client...');
    client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: 'whatsapp-flow',
        dataPath: path.join(__dirname, '.wwebjs_auth')
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
            `--window-size=${1280 + Math.floor(Math.random() * 100)},${720 + Math.floor(Math.random() * 100)}`,
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          ],
          ignoreHTTPSErrors: true,
          defaultViewport: null
      }
    });

    client.on('qr', async (qr) => {
      console.log('QR Code received, waiting for scan...');
      qrCode = qr;
      isConnected = false;
      initializationInProgress = false;
      try {
        // Generate QR code as data URL
        qrCodeDataURL = await qrcode.toDataURL(qr);
        console.log('QR code generated and ready for display');
      } catch (error) {
        console.error('Error generating QR code:', error);
        qrCodeDataURL = null;
      }
    });

    client.on('ready', () => {
      console.log('Client is ready!');
      isConnected = true;
      qrCode = null;
      qrCodeDataURL = null;
      initializationInProgress = false;
      
      // Set the global client reference
      global.whatsappClient = client;
      console.log('WhatsApp client set globally');
    });

    client.on('authenticated', () => {
      console.log('Client is authenticated!');
      isConnected = true;
    });

      client.on('auth_failure', (msg) => {
        console.error('Authentication failure:', msg);
      isConnected = false;
          initializeClient();
    });

      client.on('disconnected', (reason) => {
      console.log('Client was disconnected:', reason);
      isConnected = false;
      global.whatsappClient = null;
      console.log('Global WhatsApp client reference cleared');
      // Try to reconnect
      setTimeout(() => {
          initializeClient();
      }, 5000);
    });

    await client.initialize();
  } catch (error) {
      console.error('Error initializing client:', error);
      initializationInProgress = false;
    isConnected = false;
  }
}

  // Initialize the client on server start
initializeClient();

  // Authentication middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, error: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
      });
  };

  // Login endpoint
  server.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      const users = await loadUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Create JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      // Return user data (excluding password) and token
      const { password: _, ...userData } = user;
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred during login' 
      });
    }
  });

  // API Endpoints
  server.get('/api/whatsapp/status', (req, res) => {
    res.json({
      isConnected: isConnected,
      hasQR: !isConnected && qrCodeDataURL !== null,
      qrCode: !isConnected ? qrCodeDataURL : null,
      state: isConnected ? 'CONNECTED' : 'DISCONNECTED'
    });
  });

  server.get('/api/whatsapp/messages', async (req, res) => {
    try {
      const messages = await loadMessages();
      res.json(messages);
  } catch (error) {
      console.error('Error loading messages:', error);
      res.status(500).json({ error: 'Failed to load messages' });
  }
});

  // Modified to use message queue and rate limiting
  server.post('/api/whatsapp/send', async (req, res) => {
  try {
    console.log('Message send request received:', req.body);
    
    if (!client || !isConnected) {
      console.log('WhatsApp client not connected, attempting to initialize...');
      // Try to reinitialize if not connected
      await initializeClient();
      // Wait for connection
      let attempts = 0;
      while (!isConnected && attempts < 3) {
        console.log(`Waiting for connection, attempt ${attempts + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      if (!isConnected) {
        console.log('Failed to connect WhatsApp client after attempts');
        return res.status(400).json({ 
          success: false, 
          error: 'WhatsApp client is not connected. Please try again.' 
        });
      }
    }

    const { to, message } = req.body;
    console.log(`Attempting to send message to ${to}: "${message}"`);

    if (!to || !message) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    try {
        // Check rate limits
        const rateLimitKey = req.ip || to;
        console.log(`Checking rate limits for ${rateLimitKey}`);
        const rateLimitResult = await consumeRateLimits(rateLimitKey);
        
        if (!rateLimitResult.success) {
          const timeToWait = rateLimitResult.msBeforeNext ? 
            Math.ceil(rateLimitResult.msBeforeNext / 1000) : 60;
          
          console.log(`Rate limit exceeded for ${rateLimitKey}. Wait time: ${timeToWait}s`);
          
          // Save failed message to history
          const messageRecord = {
            id: Date.now().toString(),
            to,
            message,
            status: 'rate-limited',
            error: `Rate limit exceeded. Try again in ${timeToWait} seconds.`,
            timestamp: new Date().toISOString()
          };
          await saveMessage(messageRecord);
          
          return res.status(429).json({ 
            success: false, 
            error: `Rate limit exceeded. Try again in ${timeToWait} seconds.` 
          });
        }
        
      // Format phone number
      const formattedNumber = to.replace(/[^\d]/g, '');
      console.log(`Formatted phone number: ${formattedNumber}`);
      
      // Check if the number exists on WhatsApp
      console.log('Checking if number exists on WhatsApp...');
      try {
      const numberDetails = await client.getNumberId(formattedNumber);
      if (!numberDetails) {
          console.log(`Number ${formattedNumber} not registered on WhatsApp`);
        throw new Error('Invalid phone number or not registered on WhatsApp');
      }
        console.log('Number exists on WhatsApp:', numberDetails);
      } catch (numError) {
        console.error('Error checking number:', numError);
        throw numError;
      }
      
      // Queue the message instead of sending directly
      console.log('Queueing message...');
      const jobId = await queueMessage(formattedNumber, message, req.ip);
      console.log(`Message queued with job ID: ${jobId}`);

      // Save message to history
      const messageRecord = {
          id: jobId,
        to: formattedNumber,
        message,
          status: 'queued',
        timestamp: new Date().toISOString()
      };
      await saveMessage(messageRecord);
      console.log('Message saved to history');

        res.json({ 
          success: true, 
          message: 'Message queued successfully',
          jobId
        });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Save failed message to history
      const messageRecord = {
        id: Date.now().toString(),
        to,
        message,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      await saveMessage(messageRecord);

      // Check if it's a session error
      if (error.message.includes('Session closed') || error.message.includes('Protocol error')) {
        // Trigger client reinitialization
        isConnected = false;
        initializeClient();
        return res.status(500).json({ 
          success: false, 
          error: 'WhatsApp session expired. Please try again in a few moments.' 
        });
      }

      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to send message' 
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    });
  }
});

  // New endpoint for bulk messaging
  server.post('/api/whatsapp/bulk', async (req, res) => {
  try {
      if (!client || !isConnected) {
        return res.status(400).json({ 
          success: false, 
          error: 'WhatsApp client is not connected. Please try again.' 
        });
      }

      const { contacts } = req.body;

      if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No contacts provided for bulk messaging' 
        });
      }

      // Check rate limit for bulk operations
      const rateLimitKey = req.ip;
      const rateLimitResult = await consumeRateLimits(rateLimitKey, contacts.length);
      
      if (!rateLimitResult.success) {
        const timeToWait = rateLimitResult.msBeforeNext ? 
          Math.ceil(rateLimitResult.msBeforeNext / 1000) : 60;
        
        return res.status(429).json({ 
          success: false, 
          error: `Rate limit exceeded. Try again in ${timeToWait} seconds.` 
        });
      }

      // Prepare messages for queueing
      const messages = contacts.map(contact => ({
        to: contact.phone.replace(/[^\d]/g, ''),
        message: contact.message,
        userId: req.ip
      }));

      // Queue all messages
      const jobIds = await queueBulkMessages(messages);

      // Save messages to history
      for (let i = 0; i < messages.length; i++) {
        await saveMessage({
          id: jobIds[i],
          to: messages[i].to,
          message: messages[i].message,
          status: 'queued',
          timestamp: new Date().toISOString()
        });
      }

      res.json({ 
        success: true, 
        message: `${messages.length} messages queued successfully`,
        jobIds
      });
  } catch (error) {
      console.error('Error in bulk messaging:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to queue bulk messages' 
      });
  }
});

// Disconnect endpoint
  server.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    console.log('Disconnect requested');
    
    if (!client) {
      return res.status(400).json({ success: false, error: 'WhatsApp client is not initialized' });
    }

    // Destroy the client session
    try {
      await client.destroy();
    } catch (err) {
      console.error('Error destroying client:', err);
    }
    
    client = null;
    isConnected = false;
    qrCode = null;
    qrCodeDataURL = null;
    initializationInProgress = false;

    // Clear the session files
    try {
      await clearSession();
    } catch (err) {
      console.error('Error clearing session files:', err);
    }

    // Reinitialize the client after a short delay
    setTimeout(() => {
      initializeClient();
    }, 2000);

    res.json({ success: true, message: 'Successfully disconnected' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect WhatsApp' });
  }
});

  // Templates endpoints
  server.get('/api/templates', async (req, res) => {
  try {
    const templates = await loadTemplates();
      res.json(templates);
  } catch (error) {
      console.error('Error loading templates:', error);
      res.status(500).json({ error: 'Failed to load templates' });
  }
});

  server.post('/api/templates', async (req, res) => {
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

  // Error handler for Next.js
  server.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (res.headersSent) {
      return next(err);
    }

    if (err.message && err.message.includes('body object should not be disturbed or locked')) {
      // This is a Next.js error, let's handle it gracefully
      return res.status(500).send('An error occurred with the request. Please try again.');
    }
    
    res.status(500).send('Server error');
  });

  // Handle Next.js requests - use a try-catch block to handle potential errors
  server.all('*', async (req, res, next) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Next.js request handler error:', err);
      next(err);
  }
});

  // Start server
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error preparing Next.js app:', err);
  process.exit(1);
}); 