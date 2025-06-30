#!/bin/bash
# Script to fix WhatsApp API and generate QR code
# Run this as: sudo bash fix-whatsapp-all-in-one.sh

echo "==== WhatsApp API Fix & QR Code Generator ===="
echo "This script will fix your WhatsApp API server and generate a QR code for authentication."

# Kill any existing node processes
echo "[1/8] Stopping existing Node.js processes..."
pkill -9 -f node
sleep 2

# Install required packages
echo "[2/8] Installing required packages..."
apt-get update
apt-get install -y chromium-browser

# Create a WhatsApp test client for QR code generation
echo "[3/8] Creating QR code generator script..."
cat > /tmp/whatsapp-qr.js << 'EOL'
// WhatsApp QR Code Generator
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
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
    '--window-size=1280,720'
  ]
};

// Create client
const client = new Client({
  puppeteer: puppeteerConfig,
  authStrategy: new LocalAuth({
    clientId: 'instance1',
    dataPath: path.join(process.cwd(), '.wwebjs_auth')
  })
});

// Handle QR code generation
client.on('qr', (qr) => {
  console.log('\n\n===== WHATSAPP QR CODE =====\n');
  qrcode.generate(qr, { small: false });
  console.log('\n===== SCAN THIS QR CODE WITH YOUR PHONE =====');
  console.log('\n1. Open WhatsApp on your phone');
  console.log('2. Tap Menu or Settings and select Linked Devices');
  console.log('3. Tap on "Link a Device"');
  console.log('4. Point your phone at this screen to scan the QR code\n');
});

// Handle authentication
client.on('authenticated', () => {
  console.log('AUTHENTICATED SUCCESSFULLY!');
  console.log('You can now press Ctrl+C and restart your WhatsApp API service with:');
  console.log('cd /home/user/whatsapp-api && pm2 start src/server.js --name whatsapp-api');
});

client.on('ready', () => {
  console.log('WhatsApp client is ready and fully authenticated!');
  console.log('You can now press Ctrl+C and restart your WhatsApp API service with:');
  console.log('cd /home/user/whatsapp-api && pm2 start src/server.js --name whatsapp-api');
});

// Initialize client
client.initialize();
EOL

# Create Puppeteer configuration for main app
echo "[4/8] Setting up Puppeteer configuration..."
mkdir -p /home/user/whatsapp-api/src/config

cat > /home/user/whatsapp-api/src/config/puppeteer.config.js << 'EOL'
module.exports = {
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
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--allow-running-insecure-content',
    '--disable-web-security',
    '--disable-features=site-per-process',
    '--disable-features=IsolateOrigins'
  ],
  defaultViewport: {
    width: 1280,
    height: 720
  },
  ignoreHTTPSErrors: true,
  timeout: 0
};
EOL

# Fix the main application code
echo "[5/8] Updating WhatsApp manager code..."
cd /home/user/whatsapp-api/src
if ! grep -q "puppeteerConfig" whatsapp-manager.js; then
  sed -i '5a const puppeteerConfig = require("./config/puppeteer.config");' whatsapp-manager.js
  sed -i 's|puppeteer: {|puppeteer: {\n      ...puppeteerConfig,|g' whatsapp-manager.js
fi

# Set Chrome environment variable
echo "[6/8] Setting Chrome environment variable..."
if ! grep -q "CHROME_BIN=" /home/user/whatsapp-api/.env; then
  echo "CHROME_BIN=/usr/bin/chromium-browser" >> /home/user/whatsapp-api/.env
fi

# Clean up session data
echo "[7/8] Cleaning up session data..."
rm -rf /home/user/whatsapp-api/.wwebjs_auth/*
mkdir -p /home/user/whatsapp-api/.wwebjs_auth

# Fix permissions
echo "[8/8] Fixing permissions..."
chown -R user:user /home/user/whatsapp-api/

# Show instructions for running the QR code generator
echo ""
echo "=== SETUP COMPLETE ==="
echo "Now run the following commands to generate the QR code:"
echo ""
echo "cd /home/user/whatsapp-api"
echo "node /tmp/whatsapp-qr.js"
echo ""
echo "After scanning the QR code, press Ctrl+C and start your service with:"
echo "pm2 start src/server.js --name whatsapp-api"
echo ""

# Ask if user wants to run the QR generator now
read -p "Do you want to run the QR generator now? (y/n): " run_qr
if [[ $run_qr == "y" ]]; then
  cd /home/user/whatsapp-api
  node /tmp/whatsapp-qr.js
fi 