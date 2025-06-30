// WhatsApp QR Code Generator Helper
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

console.log('Starting WhatsApp QR code generator...');

// Puppeteer configuration
const puppeteerConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-notifications',
    '--window-size=1280,720',
    '--window-position=0,0',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--allow-running-insecure-content',
    '--disable-web-security',
    '--disable-features=site-per-process',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials'
  ],
  defaultViewport: {
    width: 1280,
    height: 720
  },
  ignoreHTTPSErrors: true,
  timeout: 0
};

// Create client with improved options
const client = new Client({
  puppeteer: puppeteerConfig,
  authStrategy: new LocalAuth({
    clientId: 'instance1',
    dataPath: path.join(__dirname, '.wwebjs_auth')
  }),
  qrMaxRetries: 5
});

// Handle QR code generation
client.on('qr', (qr) => {
  console.log('\n\n===== WHATSAPP QR CODE =====\n');
  qrcode.generate(qr, { small: false });
  console.log('\n===== SCAN THIS QR CODE WITH YOUR PHONE =====');
  console.log('QR Code string:', qr);
  
  // Also save to file
  fs.writeFileSync('whatsapp_qr.txt', qr);
  console.log('\nQR code also saved to whatsapp_qr.txt');
});

// Handle authentication
client.on('authenticated', () => {
  console.log('AUTHENTICATED SUCCESSFULLY!');
});

// Handle errors
client.on('auth_failure', (msg) => {
  console.error('AUTHENTICATION FAILURE:', msg);
});

client.on('disconnected', (reason) => {
  console.log('Client disconnected:', reason);
});

// Initialize client
console.log('Initializing client...');
client.initialize().catch(err => {
  console.error('Failed to initialize client:', err);
}); 