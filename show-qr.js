// Simple script to display WhatsApp QR code
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('Starting WhatsApp QR code generator...');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'instance1',
  }),
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

client.on('qr', (qr) => {
  console.log('\n\n===== WHATSAPP QR CODE =====\n');
  qrcode.generate(qr, { small: false });
  console.log('\n===== SCAN THIS QR CODE WITH YOUR PHONE =====');
  console.log('\n1. Open WhatsApp on your phone');
  console.log('2. Tap Menu or Settings and select Linked Devices');
  console.log('3. Tap on "Link a Device"');
  console.log('4. Point your phone at this screen to scan the QR code\n');
  
  // Also output the QR code as a string for API access
  console.log('QR code string (for API):', qr);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED SUCCESSFULLY!');
  process.exit(0);
});

client.on('ready', () => {
  console.log('WhatsApp client is ready and fully authenticated!');
  process.exit(0);
});

client.initialize(); 