const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

console.log('Starting WhatsApp QR code generator...');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'instance1'
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
      '--disable-gpu'
    ]
  }
});

client.on('qr', qr => {
  console.log('QR CODE RECEIVED:');
  qrcode.generate(qr, { small: true });
  
  try {
    fs.writeFileSync('/tmp/whatsapp_qr.txt', qr);
    console.log('\nQR code also saved to /tmp/whatsapp_qr.txt');
    console.log('\nScan this QR code with your WhatsApp mobile app:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Tap Menu or Settings');
    console.log('3. Select WhatsApp Web');
    console.log('4. Point your phone to scan the QR code');
  } catch (err) {
    console.error('Error saving QR code to file:', err);
  }
});

client.on('ready', () => {
  console.log('Client is ready! Authentication successful.');
  process.exit(0);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED SUCCESSFULLY!');
});

client.initialize().catch(err => {
  console.error('Initialization error:', err);
}); 