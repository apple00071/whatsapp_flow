#!/bin/bash

echo "🚀 Starting WhatsApp Flow Backend on Google Cloud VM"
echo "=================================================="

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "chrome" 2>/dev/null || true

# Create necessary directories
echo "📂 Creating directories..."
mkdir -p data
mkdir -p logs
mkdir -p .wwebjs_auth

# Create empty data files if they don't exist
touch data/messages.json
touch data/templates.json
touch data/users.json

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 .
chmod 666 data/*.json 2>/dev/null || true

# Get external IP
EXTERNAL_IP=$(curl -s http://ipinfo.io/ip 2>/dev/null || echo "unknown")
echo "🌐 External IP: $EXTERNAL_IP"

# Create .env file
echo "⚙️ Creating environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
JWT_SECRET=whatsapp-flow-secret-key-$(date +%s)
CHROME_PATH=/usr/bin/google-chrome
CLIENT_URL=https://whatsapp-flow-psi.vercel.app
EXTERNAL_IP=$EXTERNAL_IP
EOF

echo "📄 Environment file created with:"
cat .env

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
else
    echo "✅ Dependencies already installed"
fi

# Open firewall port
echo "🔥 Opening firewall port 3001..."
sudo ufw allow 3001/tcp 2>/dev/null || true

# Start the server with PM2
echo "🚀 Starting server with PM2..."
pm2 start server.js --name whatsapp-flow --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup

echo ""
echo "✅ Backend startup completed!"
echo "=============================="
echo ""
echo "📊 Check status:"
echo "   pm2 list"
echo "   pm2 logs whatsapp-flow"
echo ""
echo "🌐 Test API endpoints:"
echo "   curl http://localhost:3001/api/whatsapp/status"
echo "   curl http://$EXTERNAL_IP:3001/api/whatsapp/status"
echo ""
echo "🔧 If you need to restart:"
echo "   pm2 restart whatsapp-flow"
echo ""
echo "📝 View logs:"
echo "   pm2 logs whatsapp-flow --lines 50"
echo ""
echo "🛑 To stop:"
echo "   pm2 stop whatsapp-flow" 