#!/bin/bash
# Script to generate WhatsApp QR code

cat > /tmp/qr-gen.js << 'EOL'
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

console.log('Starting WhatsApp QR code generator...');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'instance1',
    dataPath: '/home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth'
  }),
  puppeteer: {
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
      '--disable-notifications'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('\n\n===== WHATSAPP QR CODE =====\n');
  qrcode.generate(qr, { small: false });
  console.log('\n===== SCAN THIS QR CODE WITH YOUR PHONE =====');
  
  // Save QR to text file
  try {
    fs.writeFileSync('/tmp/qr-code.txt', qr);
    console.log('\nQR code saved to /tmp/qr-code.txt');
  } catch (err) {
    console.error('Error saving QR code:', err);
  }
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED SUCCESSFULLY!');
  process.exit(0);
});

client.initialize();
EOL

# Run the QR code generator
cd /home/applegraphicshyd/Onnrides-WhatsApp
node /tmp/qr-gen.js 