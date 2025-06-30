#!/bin/bash

# Comprehensive setup script for WhatsApp Flow backend
echo "Setting up WhatsApp Flow backend..."

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt install -y curl wget build-essential git

# Install Node.js 18
echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install Google Chrome (required for WhatsApp Web)
echo "Installing Google Chrome..."
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb

# Create data directory
echo "Creating data directory..."
mkdir -p ~/whatsapp_flow/data

# Install project dependencies
echo "Installing project dependencies..."
cd ~/whatsapp_flow
npm install express http whatsapp-web.js qrcode cors fs path next helmet express-rate-limit jsonwebtoken

# Create environment file
echo "Creating .env file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
JWT_SECRET=whatsapp-flow-secret-key
CHROME_PATH=/usr/bin/google-chrome
CLIENT_URL=http://whatsapp-flow-psi.vercel.app
EOF

# Open firewall port
echo "Opening firewall port 3001..."
sudo ufw allow 3001/tcp

# Start the server
echo "Starting the server..."
pm2 stop whatsapp-flow || true
pm2 delete whatsapp-flow || true
pm2 start server.js --name whatsapp-flow

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Set PM2 to start on boot
echo "Setting PM2 to start on boot..."
pm2 startup | tail -n 1 | bash

echo "Setup complete! The server should be running at http://$(hostname -I | awk '{print $1}'):3001"
echo "External IP: $(curl -s http://ipinfo.io/ip)" 