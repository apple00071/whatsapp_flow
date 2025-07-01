const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { promisify } = require('util');

// Only initialize the client on the server side
const isServer = typeof window === 'undefined';

let globalClient = null;
let initializationInProgress = false;

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const rm = promisify(fs.rm);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * WhatsApp client wrapper using whatsapp-web.js
 */
class WhatsAppClient {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.hasQR = false;
    this.qrCode = null;
    this.authPath = path.join(process.cwd(), '.wwebjs_auth');
    this.dataPath = path.join(process.cwd(), '.wwebjs_data');
    this.lockFile = path.join(process.cwd(), '.wwebjs_auth', 'lock');
    this.cleanupTimeout = null;
    this.connectionRetries = 0;
    this.MAX_RETRIES = 3;
    this.isShuttingDown = false;
    this.browser = null;
    this.messageCount = 0;
    this.lastMessageTime = new Date();

    if (isServer) {
      this.setupCleanupHandlers();
      // Clean up on startup
      this.cleanupStaleData().catch(err => console.error('Error cleaning stale data', err));
    }
  }

  static getInstance() {
    if (!globalClient) {
      console.log('Creating new WhatsAppClient instance...');
      globalClient = new WhatsAppClient();
    }
    return globalClient;
  }

  setupCleanupHandlers() {
    const cleanup = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      await this.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', () => {
      if (!this.isShuttingDown) {
        this.cleanup().catch(console.error);
      }
    });

    // Handle uncaught errors
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught Exception:', error);
      await cleanup();
    });

    process.on('unhandledRejection', async (error) => {
      console.error('Unhandled Rejection:', error);
      await cleanup();
    });
  }

  async cleanupStaleData() {
    try {
      // Remove stale lock file if it exists
      if (await exists(this.lockFile)) {
        try {
          const lockData = await readFile(this.lockFile, 'utf8');
          const pid = parseInt(lockData, 10);
          
          // Check if the process is still running
          try {
            process.kill(pid, 0);
            // If we get here, the process is still running
            if (pid === process.pid) {
              // It's our own process, we can remove the lock
              await rm(this.lockFile, { force: true });
            } else {
              console.log(`Process ${pid} is still running`);
              return;
            }
          } catch (e) {
            // Process is not running, safe to remove lock
            await rm(this.lockFile, { force: true });
          }
        } catch (error) {
          // If we can't read or parse the lock file, remove it
          await rm(this.lockFile, { force: true });
        }
      }

      // Clean up auth and data directories if they exist
      for (const dir of [this.authPath, this.dataPath]) {
        if (await exists(dir)) {
          try {
            await rm(dir, { recursive: true, force: true });
          } catch (error) {
            // Ignore EBUSY errors and continue
            if (error.code !== 'EBUSY') {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up stale data:', error);
    }
  }

  async cleanup() {
    console.log('Cleaning up WhatsApp client...');
    this.isShuttingDown = true;
    
    // Clear the lock file refresh interval
    if (this.cleanupTimeout) {
      clearInterval(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }

    // Release the lock file
    try {
      if (await exists(this.lockFile)) {
        await rm(this.lockFile);
      }
    } catch (error) {
      console.error('Error releasing lock file:', error);
    }

    // Destroy the client if it exists
    if (this.client) {
      try {
        console.log('Destroying WhatsApp client...');
        await this.client.destroy();
        console.log('WhatsApp client destroyed successfully');
      } catch (error) {
        console.error('Error destroying WhatsApp client:', error);
      }
      this.client = null;
    }

    // Close the browser if it exists
    if (this.browser) {
      try {
        console.log('Closing browser...');
        await this.browser.close();
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error);
      }
      this.browser = null;
    }

    this.isReady = false;
    this.hasQR = false;
    this.qrCode = null;
    this.isShuttingDown = false;
    console.log('Cleanup completed');
  }

  async sendMessage(to, message) {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    // Format the phone number
    const formattedPhone = this.formatPhoneNumber(to);
    
    // Add slight variations to the message to avoid detection
    const finalMessage = this.addMessageVariations(message);
    
    try {
      // Send the message
      const result = await this.client.sendMessage(formattedPhone, finalMessage);
      
      // Update message count and time
      this.messageCount++;
      this.lastMessageTime = new Date();
      
      return result;
    } catch (error) {
      console.error(`Error sending message to ${formattedPhone}:`, error);
      throw error;
    }
  }

  addMessageVariations(message) {
    // Add a zero-width space at a random position
    const position = Math.floor(Math.random() * message.length);
    const zwsp = '\u200B'; // Zero-width space
    const modifiedMessage = message.slice(0, position) + zwsp + message.slice(position);
    
    return modifiedMessage;
  }

  formatPhoneNumber(phone) {
    // Remove any non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Ensure the number has the country code
    if (!cleaned.startsWith('1') && !cleaned.startsWith('91')) {
      cleaned = '1' + cleaned; // Default to US country code
    }
    
    // Add the @c.us suffix required by WhatsApp Web
    return cleaned + '@c.us';
  }

  async getStatus() {
    const status = {
      initialized: !!this.client,
      ready: this.isReady,
      hasQR: this.hasQR,
      qrCode: this.qrCode,
      messageCount: this.messageCount,
      lastMessageTime: this.lastMessageTime.toISOString(),
    };

    if (this.client) {
      try {
        status.connectionState = this.client.getState();
      } catch (error) {
        status.connectionState = 'unknown';
        status.error = error.message;
      }
    } else {
      status.connectionState = 'disconnected';
    }

    return status;
  }

  async initialize() {
    if (initializationInProgress) {
      console.log('Initialization already in progress...');
      return;
    }

    if (this.client) {
      console.log('Client already exists, cleaning up first...');
      await this.cleanup();
      // Add a small delay after cleanup
      await sleep(2000);
    }

    try {
      initializationInProgress = true;
      
      // Ensure directories exist
      await this.ensureDirectories();
      
      console.log('Creating new WhatsApp client...');

      // Launch browser first with randomized parameters
      const viewportWidth = 1280 + Math.floor(Math.random() * 100);
      const viewportHeight = 720 + Math.floor(Math.random() * 100);
      
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            `--window-size=${viewportWidth},${viewportHeight}`,
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          ],
          ignoreHTTPSErrors: true,
          defaultViewport: null
        });
      } catch (error) {
        console.error('Error launching browser:', error);
        throw new Error('Failed to launch browser: ' + error.message);
      }

      // Now create the WhatsApp client
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'whatsapp-flow',
          dataPath: this.authPath
        }),
        puppeteer: {
          browser: this.browser,
          defaultViewport: null // Use the viewport size from the browser
        }
      });

      this.client.on('qr', (qr) => {
        console.log('QR Code received, waiting for scan');
        this.qrCode = qr;
        this.hasQR = true;
        this.isReady = false;
      });

      this.client.on('authenticated', () => {
        console.log('Client authenticated');
        this.hasQR = false;
        this.qrCode = null;
      });

      this.client.on('ready', () => {
        console.log('Client ready event received!');
        this.isReady = true;
        this.hasQR = false;
        this.qrCode = null;
        this.connectionRetries = 0;
      });

      // Add connection state change handler
      this.client.on('change_state', (state) => {
        console.log('Connection state changed to:', state);
        if (state === 'CONNECTED') {
          this.isReady = true;
          this.hasQR = false;
          this.qrCode = null;
        }
      });

      this.client.on('auth_failure', async (msg) => {
        console.error('Authentication failed:', msg);
        this.isReady = false;
        if (this.connectionRetries < this.MAX_RETRIES) {
          this.connectionRetries++;
          console.log(`Retrying authentication (${this.connectionRetries}/${this.MAX_RETRIES})...`);
          await sleep(5000); // Add delay before retry
          await this.cleanup();
          await this.initialize();
        } else {
          console.error('Max retries reached, giving up.');
          await this.cleanup();
        }
      });

      this.client.on('disconnected', async (reason) => {
        console.error('Client disconnected:', reason);
        this.isReady = false;
        if (!this.isShuttingDown && this.connectionRetries < this.MAX_RETRIES) {
          this.connectionRetries++;
          console.log(`Attempting to reconnect (${this.connectionRetries}/${this.MAX_RETRIES})...`);
          await sleep(5000); // Add delay before retry
          await this.cleanup();
          await this.initialize();
        } else {
          await this.cleanup();
        }
      });

      console.log('Initializing WhatsApp client...');
      await this.client.initialize();
      console.log('WhatsApp client initialized successfully');
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      await this.cleanup();
      throw error;
    } finally {
      initializationInProgress = false;
    }
  }
  
  async ensureDirectories() {
    try {
      // Ensure auth directory exists
      if (!await exists(this.authPath)) {
        await mkdir(this.authPath, { recursive: true });
      }
      
      // Ensure data directory exists
      if (!await exists(this.dataPath)) {
        await mkdir(this.dataPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error ensuring directories:', error);
      throw error;
    }
  }

  isInitialized() {
    return !!this.client && this.isReady;
  }
}

const getWhatsAppClient = () => {
  if (!isServer) return null;
  const instance = WhatsAppClient.getInstance();
  
  // Initialize if not already initialized
  if (!instance.isInitialized()) {
    console.log('WhatsApp client not initialized, initializing now...');
    // Start initialization in background
    instance.initialize().catch(err => 
      console.error('Error initializing WhatsApp client:', err)
    );
  }
  
  return instance;
};

/**
 * WhatsApp Client Module
 * Simple module to handle WhatsApp client functionality
 */

// This is a placeholder for the actual WhatsApp client implementation
const whatsappClient = {
  isReady: false,
  
  // Send a message to a specific phone number
  sendMessage: async (phone, message) => {
    console.log(`Sending message to ${phone}: ${message}`);
    return { success: true, message: 'Message sent successfully' };
  },
  
  // Get the client status
  getStatus: () => {
    return {
      isConnected: whatsappClient.isReady,
      status: whatsappClient.isReady ? 'CONNECTED' : 'DISCONNECTED'
    };
  },
  
  // Set the client as ready
  setReady: (status) => {
    whatsappClient.isReady = status;
  }
};

module.exports = whatsappClient; 