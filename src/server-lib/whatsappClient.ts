import { Client, LocalAuth } from 'whatsapp-web.js';
import { Message } from './types';
import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { WAState } from 'whatsapp-web.js';
import { promisify } from 'util';
import logger from './logger';

// Only initialize the client on the server side
const isServer = typeof window === 'undefined';

let globalClient: WhatsAppClient | null = null;
let initializationInProgress = false;

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const rm = promisify(fs.rm);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * WhatsApp client wrapper using whatsapp-web.js
 */
export class WhatsAppClient {
  private client: Client | null = null;
  private isReady: boolean = false;
  private hasQR: boolean = false;
  private qrCode: string | null = null;
  private authPath: string = path.join(process.cwd(), '.wwebjs_auth');
  private dataPath: string = path.join(process.cwd(), '.wwebjs_data');
  private lockFile: string = path.join(process.cwd(), '.wwebjs_auth', 'lock');
  private cleanupTimeout: NodeJS.Timeout | null = null;
  private connectionRetries: number = 0;
  private readonly MAX_RETRIES: number = 3;
  private isShuttingDown: boolean = false;
  private browser: any | null = null;
  private messageCount: number = 0;
  private lastMessageTime: Date = new Date();

  constructor() {
    if (isServer) {
      this.setupCleanupHandlers();
      // Clean up on startup
      this.cleanupStaleData().catch(err => logger.error('Error cleaning stale data', err));
    }
  }

  public static getInstance(): WhatsAppClient {
    if (!globalClient) {
      logger.info('Creating new WhatsAppClient instance...');
      globalClient = new WhatsAppClient();
    }
    return globalClient;
  }

  private setupCleanupHandlers() {
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
      logger.error('Uncaught Exception:', error);
      await cleanup();
    });

    process.on('unhandledRejection', async (error) => {
      logger.error('Unhandled Rejection:', error);
      await cleanup();
    });
  }

  private async cleanupStaleData() {
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
              logger.info(`Process ${pid} is still running`);
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
          } catch (error: any) {
            // Ignore EBUSY errors and continue
            if (error.code !== 'EBUSY') {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error cleaning up stale data:', error);
    }
  }

  private async cleanup() {
    logger.info('Cleaning up WhatsApp client...');
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
      logger.error('Error releasing lock file:', error);
    }

    // Destroy the client if it exists
    if (this.client) {
      try {
        logger.info('Destroying WhatsApp client...');
        await this.client.destroy();
        logger.info('WhatsApp client destroyed successfully');
      } catch (error) {
        logger.error('Error destroying WhatsApp client:', error);
      }
      this.client = null;
    }

    // Close the browser if it exists
    if (this.browser) {
      try {
        logger.info('Closing browser...');
        await this.browser.close();
        logger.info('Browser closed successfully');
      } catch (error) {
        logger.error('Error closing browser:', error);
      }
      this.browser = null;
    }

    this.isReady = false;
    this.hasQR = false;
    this.qrCode = null;
    this.isShuttingDown = false;
    logger.info('Cleanup completed');
  }

  private async ensureDirectories() {
    try {
      for (const dir of [this.authPath, this.dataPath]) {
        if (!await exists(dir)) {
          await mkdir(dir, { recursive: true });
        }
      }
    } catch (error) {
      logger.error('Error creating directories:', error);
      throw error;
    }
  }

  private async acquireLock(): Promise<boolean> {
    try {
      if (await exists(this.lockFile)) {
        try {
          const lockData = await readFile(this.lockFile, 'utf8');
          const pid = parseInt(lockData, 10);
          
          try {
            process.kill(pid, 0);
            // Process is running
            if (pid === process.pid) {
              return true; // We already have the lock
            }
            return false;
          } catch (e) {
            // Process is not running, we can take the lock
            await rm(this.lockFile, { force: true });
          }
        } catch (error) {
          // If we can't read the lock file, assume it's stale
          await rm(this.lockFile, { force: true });
        }
      }
      
      await writeFile(this.lockFile, process.pid.toString());
      return true;
    } catch (error) {
      logger.error('Error acquiring lock:', error);
      return false;
    }
  }

  async initialize() {
    if (initializationInProgress) {
      logger.info('Initialization already in progress...');
      return;
    }

    if (this.client) {
      logger.info('Client already exists, cleaning up first...');
      await this.cleanup();
      // Add a small delay after cleanup
      await sleep(2000);
    }

    try {
      initializationInProgress = true;
      await this.ensureDirectories();
      
      if (!await this.acquireLock()) {
        throw new Error('Another instance is already running');
      }

      // Keep lock file fresh
      this.cleanupTimeout = setInterval(() => {
        writeFile(this.lockFile, process.pid.toString()).catch(err => 
          logger.error('Error updating lock file', err)
        );
      }, 30000);

      logger.info('Creating new WhatsApp client...');

      // Launch browser first with randomized parameters
      const viewportWidth = 1280 + Math.floor(Math.random() * 100);
      const viewportHeight = 720 + Math.floor(Math.random() * 100);
      
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
          '--disable-extensions',
          '--disable-software-rasterizer',
          '--disable-default-apps',
          `--window-size=${viewportWidth},${viewportHeight}`,
          '--disable-features=site-per-process',
          '--disable-site-isolation-trials',
          // Remove this line which can be detected:
          // '--disable-web-security',
          // Add more human-like user agent
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ],
        executablePath: process.env.CHROME_PATH || undefined,
        defaultViewport: {
          width: viewportWidth,
          height: viewportHeight
        },
        timeout: 120000,
      });

      // Handle browser disconnection
      this.browser.on('disconnected', async () => {
        logger.warn('Browser disconnected, cleaning up...');
        await this.cleanup();
      });

      // Create a new page to test navigation
      const testPage = await this.browser.newPage();
      try {
        await testPage.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        logger.info('Browser navigation test successful');
        await testPage.close();
      } catch (error) {
        logger.error('Browser navigation test failed', error);
        await testPage.close();
        throw new Error('Browser navigation test failed');
      }

      // Now create the WhatsApp client
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'whatsapp-flow',
          dataPath: this.authPath
        }),
        puppeteer: {
          // @ts-ignore - Use browser instance directly
          browser: this.browser,
          // Add more randomized parameters
          defaultViewport: null // Use the viewport size from the browser
        }
      });

      this.client.on('qr', (qr) => {
        logger.whatsapp('QR Code received, waiting for scan');
        this.qrCode = qr;
        this.hasQR = true;
        this.isReady = false;
      });

      this.client.on('authenticated', async () => {
        logger.whatsapp('Client authenticated');
        try {
          // Wait a moment for the connection to stabilize
          await sleep(2000);
          
          // Check state after authentication
          const state = await this.client?.getState();
          logger.whatsapp('State after authentication:', state);
          
          this.hasQR = false;
          this.qrCode = null;
          
          if (state === WAState.CONNECTED) {
            logger.whatsapp('Connection confirmed after authentication');
            this.isReady = true;
          } else {
            logger.warn('Unexpected state after authentication:', state);
          }
        } catch (error) {
          logger.error('Error checking state after authentication:', error);
        }
      });

      this.client.on('ready', async () => {
        try {
          logger.whatsapp('Client ready event received!');
          // Double check the connection state
          const state = await this.client?.getState();
          logger.whatsapp('Connection state on ready:', state);
          
          if (state === WAState.CONNECTED) {
            logger.whatsapp('Connection confirmed in ready event');
            this.isReady = true;
            this.hasQR = false;
            this.qrCode = null;
            this.connectionRetries = 0;
          } else {
            logger.warn('Unexpected state in ready event:', state);
            // Try to verify connection through alternative means
            try {
              const isRegistered = await this.client?.isRegisteredUser('123456789@c.us');
              logger.info('Alternative connection check result:', isRegistered);
              if (isRegistered) {
                logger.whatsapp('Connection verified through alternative check');
                this.isReady = true;
              }
            } catch (error) {
              logger.error('Error in alternative connection check:', error);
              this.isReady = false;
            }
          }
        } catch (error) {
          logger.error('Error in ready event:', error);
          this.isReady = false;
        }
      });

      // Add connection state change handler
      this.client.on('change_state', async (state) => {
        logger.whatsapp('Connection state changed to:', state);
        if (state === WAState.CONNECTED) {
          this.isReady = true;
          this.hasQR = false;
          this.qrCode = null;
        }
      });

      // Add connection update handler
      this.client.on('connection_update', async (update) => {
        logger.whatsapp('Connection update:', update);
      });

      this.client.on('auth_failure', async (msg) => {
        logger.whatsappError('Authentication failed:', msg);
        this.isReady = false;
        if (this.connectionRetries < this.MAX_RETRIES) {
          this.connectionRetries++;
          logger.info(`Retrying authentication (${this.connectionRetries}/${this.MAX_RETRIES})...`);
          await sleep(5000); // Add delay before retry
          await this.cleanup();
          await this.initialize();
        } else {
          logger.error('Max retries reached, giving up.');
          await this.cleanup();
        }
      });

      this.client.on('disconnected', async (reason) => {
        logger.whatsappError('Client disconnected:', reason);
        this.isReady = false;
        if (!this.isShuttingDown && this.connectionRetries < this.MAX_RETRIES) {
          this.connectionRetries++;
          logger.info(`Attempting to reconnect (${this.connectionRetries}/${this.MAX_RETRIES})...`);
          await sleep(5000); // Add delay before retry
          await this.cleanup();
          await this.initialize();
        } else {
          await this.cleanup();
        }
      });

      logger.info('Initializing WhatsApp client...');
      await this.client.initialize();
      logger.whatsapp('WhatsApp client initialized successfully');
    } catch (error) {
      logger.error('Error initializing WhatsApp client:', error);
      await this.cleanup();
      throw error;
    } finally {
      initializationInProgress = false;
    }
  }

  public async sendMessage(to: string, message: string) {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }
    
    logger.whatsapp(`Sending message to ${to}`);
    
    // Format the number to ensure it has the correct format
    const formattedNumber = this.formatPhoneNumber(to);
    
    // Apply message variations to appear more human-like
    const processedMessage = this.addMessageVariations(message);
    
    // Track message count and time for throttling
    this.messageCount++;
    const now = new Date();
    const timeSinceLastMessage = now.getTime() - this.lastMessageTime.getTime();
    
    // If we've sent messages too quickly, add a delay
    if (timeSinceLastMessage < 2000) {
      // Add a random delay between 2-5 seconds if messages are sent too quickly
      const delay = 2000 + Math.floor(Math.random() * 3000);
      logger.info(`Throttling message, waiting ${delay}ms`);
      await sleep(delay);
    }
    
    // Update last message time
    this.lastMessageTime = new Date();
    
    try {
    // Send the message
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, processedMessage);
      logger.whatsapp(`Message sent successfully to ${to}`);
      return result;
    } catch (error) {
      logger.whatsappError(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  // Add text variations function to make messages appear more human
  private addMessageVariations(message: string): string {
    // Add signature if appropriate
    message = this.addSignature(message);
    
    // Add subtle variations like spacing or punctuation
    if (!message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?')) {
      message = message + '.';
    }
    
    return message;
  }
  
  // Add random signature to messages
  private addSignature(message: string): string {
    const signatures = [
      "\n\nBest regards,",
      "\n\nThanks,",
      "\n\nRegards,",
      "\n\nCheers,",
      "\n\nSincerely,"
    ];
    
    // Only add signature if it doesn't already have one
    if (!message.includes("regards") && !message.includes("thanks") && 
        !message.includes("cheers") && !message.includes("sincerely")) {
      // Only add signatures to longer messages and with 70% probability
      if (message.length > 50 && Math.random() < 0.7) {
        const signature = signatures[Math.floor(Math.random() * signatures.length)];
        return message + signature;
      }
    }
    
    return message;
  }
  
  // Format phone number to ensure it has the correct format
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let formattedNumber = phone.replace(/\D/g, '');
    
    // Ensure the number doesn't start with a + sign
    if (formattedNumber.startsWith('+')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    return formattedNumber;
  }

  async getStatus() {
    try {
      if (!this.client) {
        return {
          isConnected: false,
          hasQR: false,
          qrCode: null,
          error: 'Client not initialized'
        };
      }

      // Try to get the current state
      let state;
      try {
        state = await this.client.getState();
        logger.whatsapp('📱 Current state:', state);
      } catch (error) {
        logger.error('Error getting state:', error);
        // If we can't get the state, try alternative check
        try {
          const isRegistered = await this.client.isRegisteredUser('123456789@c.us');
          logger.whatsapp('Alternative status check:', isRegistered);
          if (isRegistered) {
            state = WAState.CONNECTED;
          }
        } catch (altError) {
          logger.error('Alternative status check failed:', altError);
        }
      }

      // Consider connected if:
      // 1. We have an active state AND
      // 2. No QR code is present AND
      // 3. Client reports ready
      const isConnected = (
        (state === WAState.CONNECTED || this.isReady) &&
        !this.hasQR
      );

      return {
        isConnected,
        hasQR: this.hasQR,
        qrCode: this.qrCode,
        state: state || 'UNKNOWN'
      };
    } catch (error: any) {
      logger.error('Error getting status:', error);
      return {
        isConnected: false,
        hasQR: this.hasQR,
        qrCode: this.qrCode,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  // Helper method to clear session data with retries
  public async clearSessionData(retries = 3): Promise<void> {
    // First, check if we need to destroy the client
    if (this.client) {
      try {
        await this.client.destroy();
        this.client = null;
        this.isReady = false;
        // Wait a bit after destroying the client
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error('Error destroying client:', error);
      }
    }

    const sessionDir = path.resolve(process.cwd(), '.wwebjs_auth/session-whatsapp-flow');
    const cacheDir = path.resolve(process.cwd(), '.wwebjs_cache');
    
    if (!fs.existsSync(sessionDir)) {
      logger.info('No session data found to clear');
      return;
    }
    
    logger.info('Attempting to clear session data...');
    
    const clearDirectory = async (dir: string): Promise<void> => {
      if (!fs.existsSync(dir)) return;
      
      try {
        // Try to remove the directory
        await new Promise((resolve, reject) => {
          fs.rm(dir, { recursive: true, force: true }, (err) => {
            if (err) {
              if (err.code === 'EBUSY' && retries > 0) {
                logger.info(`Resource busy, retrying in 5 seconds... (${retries} retries left)`);
                setTimeout(async () => {
                  try {
                    await clearDirectory(dir);
                    resolve(undefined);
                  } catch (error) {
                    reject(error);
                  }
                }, 5000);
              } else {
                reject(err);
              }
            } else {
              resolve(undefined);
            }
          });
        });
        logger.info(`Directory ${dir} cleared successfully`);
      } catch (error: any) {
        if (error.code === 'EBUSY' && retries > 0) {
          logger.info(`Resource busy, retrying in 5 seconds... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return clearDirectory(dir);
        } else {
          throw error;
        }
      }
    };

    try {
      await clearDirectory(sessionDir);
      await clearDirectory(cacheDir);
    } catch (error: any) {
      logger.error('Error clearing session/cache data:', error?.message || error);
      if (retries > 0) {
        logger.info(`Retrying entire cleanup in 5 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.clearSessionData(retries - 1);
      }
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this.client !== null && this.isReady;
  }
} 

// Create and export a singleton instance
export const getWhatsAppClient = (): WhatsAppClient | null => {
  if (!isServer) {
    return null;
  }
  
  if (!globalClient) {
    globalClient = new WhatsAppClient();
  }
  
  return globalClient;
}; 