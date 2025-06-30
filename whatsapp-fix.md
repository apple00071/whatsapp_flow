# WhatsApp API Fix Instructions

## Problem Summary
The WhatsApp API server is running but has two key issues:
1. The WhatsApp client needs to be authenticated with a QR code
2. The API key authorization may not be working correctly

## Solution: Step-by-Step Instructions

### 1. SSH into the VM
```
ssh applegraphicshyd@34.45.239.220
```

### 2. Restart the WhatsApp API service with debug mode enabled
```bash
cd /home/applegraphicshyd/Onnrides-WhatsApp
sudo pkill -9 -f node
sudo rm -rf .wwebjs_auth/*
export DEBUG=whatsapp-web.js:*
node src/server.js
```

### 3. Watch for the QR code to appear in the console
When the QR code appears, scan it with your phone:
1. Open WhatsApp on your phone
2. Tap Menu or Settings > Linked Devices
3. Tap "Link a Device"
4. Point your phone at the QR code on the screen

### 4. After scanning, press Ctrl+C to stop the server

### 5. Start the server with PM2 for production
```bash
cd /home/applegraphicshyd/Onnrides-WhatsApp
pm2 start src/server.js --name whatsapp-api
```

### 6. Verify the API is working
```bash
curl -s -H "Authorization: Bearer onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176" http://localhost:3001/api/status
```

### 7. If the API key still doesn't work, try this debug script
```bash
cd /tmp
node fix-api-auth.js
```

Then test the debug API:
```bash
curl -s -H "Authorization: Bearer onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176" http://localhost:3002/api/test
```

## Alternative Method
If you can't see the QR code in the console:

```bash
# Install required packages if needed
cd /home/applegraphicshyd/Onnrides-WhatsApp
npm install qrcode-terminal

# Create a QR code generator script
cat > qr-helper.js << 'EOL'
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

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
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED SUCCESSFULLY!');
  process.exit(0);
});

client.initialize();
EOL

# Run the QR generator
node qr-helper.js
``` 