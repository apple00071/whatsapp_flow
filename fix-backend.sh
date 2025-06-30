#!/bin/bash
echo "🔧 WhatsApp Flow Backend Fix Script"
echo "==================================="

# Stop all PM2 processes
echo "Stopping all PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Clean up any existing processes
echo "Cleaning up processes..."
pkill -f "node.*server.js" || true
pkill -f "chrome" || true

# Create necessary directories
echo "Creating directories..."
mkdir -p data
mkdir -p logs
mkdir -p .wwebjs_auth

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 .
chmod 666 data/*.json 2>/dev/null || true

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cat > .env << EOF
NODE_ENV=production
PORT=3001
JWT_SECRET=whatsapp-flow-secret-key-$(date +%s)
CHROME_PATH=/usr/bin/google-chrome
CLIENT_URL=https://whatsapp-flow-psi.vercel.app
EOF
fi

# Start the server
echo "Starting server with PM2..."
pm2 start server.js --name whatsapp-flow
pm2 save
pm2 startup

echo "✅ Fix script completed!"
echo "Check status with: pm2 logs whatsapp-flow"
