#!/bin/bash

# WhatsApp Flow Backend Setup Script
# Run this script on your VM to set up the backend

echo "Setting up WhatsApp Flow backend..."

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Redis if not already installed
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    sudo apt install redis-server -y
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
fi

# Install Google Chrome if not already installed
if ! command -v google-chrome &> /dev/null; then
    echo "Installing Google Chrome..."
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt install ./google-chrome-stable_current_amd64.deb -y
    rm google-chrome-stable_current_amd64.deb
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Clone the repository if it doesn't exist
if [ ! -d "whatsapp_flow" ]; then
    echo "Cloning the repository..."
    git clone https://github.com/apple00071/whatsapp_flow.git whatsapp_flow
    cd whatsapp_flow
else
    echo "Repository already exists, updating..."
    cd whatsapp_flow
    git pull origin main
fi

# Install dependencies
echo "Installing project dependencies..."
npm install

# Create logs directory
mkdir -p logs

# Create data directory
mkdir -p data

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password_if_needed

# Security
JWT_SECRET=your_random_secure_string

# Path to Chrome executable
CHROME_PATH=/usr/bin/google-chrome
EOF
    echo "Please edit the .env file with your specific configuration"
fi

# Open firewall port
echo "Opening firewall port 3001..."
sudo ufw allow 3001/tcp

# Start the server with PM2
echo "Starting the server with PM2..."
pm2 start server.js --name whatsapp-flow

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup

echo "Backend setup completed successfully!"
echo "Your WhatsApp Flow backend is running at http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "To monitor the application:"
echo "- View logs: pm2 logs whatsapp-flow"
echo "- Monitor status: pm2 monit"
echo ""
echo "Don't forget to update the CORS configuration in server.js to allow requests from your Vercel frontend!" 