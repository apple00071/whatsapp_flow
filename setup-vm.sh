#!/bin/bash

# Fix script for WhatsApp Flow backend
echo "Fixing WhatsApp Flow backend setup..."

# Stop any existing processes
echo "Stopping existing processes..."
sudo pm2 stop all || true
sudo pm2 delete all || true

# Clean up duplicate directories
echo "Cleaning up duplicate directories..."
if [ -d ~/whatsapp_flow/whatsapp_flow ]; then
  # If we have a nested directory, move everything to the parent
  sudo cp -r ~/whatsapp_flow/whatsapp_flow/* ~/whatsapp_flow/
  sudo rm -rf ~/whatsapp_flow/whatsapp_flow
fi

# Create necessary directories
echo "Creating necessary directories..."
sudo mkdir -p ~/whatsapp_flow/data
sudo mkdir -p ~/whatsapp_flow/logs
sudo mkdir -p ~/whatsapp_flow/.wwebjs_auth

# Set proper permissions
echo "Setting proper permissions..."
sudo chown -R $(whoami):$(whoami) ~/whatsapp_flow
sudo chmod -R 755 ~/whatsapp_flow

# Create empty data files
echo "Creating data files..."
sudo touch ~/whatsapp_flow/data/messages.json
sudo touch ~/whatsapp_flow/data/templates.json
sudo touch ~/whatsapp_flow/data/users.json
sudo chmod 666 ~/whatsapp_flow/data/*.json

# Get external IP
EXTERNAL_IP=$(curl -s http://ipinfo.io/ip)

# Create environment file
echo "Creating .env file..."
cat > ~/whatsapp_flow/.env << EOF
NODE_ENV=production
PORT=80
JWT_SECRET=whatsapp-flow-secret-key
CHROME_PATH=/usr/bin/google-chrome
CLIENT_URL=https://whatsapp-flow-psi.vercel.app
EXTERNAL_IP=$EXTERNAL_IP
EOF

# Install dependencies
echo "Installing dependencies..."
cd ~/whatsapp_flow
npm install --production

# Install Chrome
echo "Installing Chrome..."
sudo apt update
sudo apt install -y curl wget build-essential git
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb

# Open firewall for port 80
echo "Opening firewall for port 80..."
sudo ufw allow 80/tcp || true

# Start the server with PM2
echo "Starting the server..."
cd ~/whatsapp_flow
sudo pm2 start server.js --name whatsapp-flow
sudo pm2 save
sudo pm2 startup

# Check if the server is running
echo "Checking server status..."
sudo pm2 list
sudo pm2 logs whatsapp-flow --lines 10

# Print server information
echo "Backend API Server should be accessible at:"
echo "http://$EXTERNAL_IP:80"
echo "Frontend is deployed at: https://whatsapp-flow-psi.vercel.app" 