#!/bin/bash

# WhatsApp Flow Deployment Script
# This script automates the deployment process for WhatsApp Flow

echo "Starting WhatsApp Flow deployment..."

# 1. Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install required dependencies
echo "Installing dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    sudo apt install redis-server -y
    sudo systemctl enable redis-server
fi

# Check if Google Chrome is installed
if ! command -v google-chrome &> /dev/null; then
    echo "Installing Google Chrome..."
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt install ./google-chrome-stable_current_amd64.deb -y
    rm google-chrome-stable_current_amd64.deb
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install nginx -y
    sudo systemctl enable nginx
fi

# 3. Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# 4. Clone the repository if it doesn't exist
if [ ! -d "whatsapp-flow" ]; then
    echo "Cloning the repository..."
    git clone https://github.com/apple00071/whatsapp_flow.git whatsapp-flow
    cd whatsapp-flow
else
    echo "Repository already exists, updating..."
    cd whatsapp-flow
    git pull origin main
fi

# 5. Install dependencies
echo "Installing project dependencies..."
npm install --production

# 6. Create logs directory
mkdir -p logs

# 7. Create .env.production file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production file..."
    cat > .env.production << EOF
NODE_ENV=production
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password_if_needed

# URL where the frontend can be accessed
CLIENT_URL=https://your-domain.com

# URL where the backend API can be accessed
BACKEND_URL=https://api.your-domain.com

# Path to Chrome executable
CHROME_PATH=/usr/bin/google-chrome

# Security
SESSION_SECRET=your_random_secure_string

# Message rate limits (optional - defaults in code)
MESSAGE_RATE_LIMIT_PER_MINUTE=30
MESSAGE_RATE_LIMIT_PER_HOUR=200
MESSAGE_RATE_LIMIT_PER_DAY=1000
EOF
    echo "Please edit the .env.production file with your specific configuration"
fi

# 8. Create Nginx configuration
NGINX_CONF="/etc/nginx/sites-available/whatsapp-flow"
if [ ! -f "$NGINX_CONF" ]; then
    echo "Creating Nginx configuration..."
    sudo tee "$NGINX_CONF" > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Add security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }
    
    # Limit request size
    client_max_body_size 5M;
}
EOF
    echo "Please edit the Nginx configuration with your domain name"
    
    # Enable the configuration
    sudo ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
else
    echo "Nginx configuration already exists"
fi

# 9. Set up SSL with Let's Encrypt (if needed)
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot for SSL..."
    sudo apt install certbot python3-certbot-nginx -y
    echo "Please run 'sudo certbot --nginx -d your-domain.com' to set up SSL"
fi

# 10. Build the Next.js application
echo "Building the Next.js application..."
npm run build

# 11. Start the application with PM2
echo "Starting the application with PM2..."
pm2 start server.js --name whatsapp-flow --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup

echo "Deployment completed successfully!"
echo "You can access your WhatsApp Flow application at https://your-domain.com"
echo "Please make sure to:"
echo "1. Edit the .env.production file with your specific configuration"
echo "2. Update the Nginx configuration with your domain name"
echo "3. Set up SSL with Let's Encrypt by running 'sudo certbot --nginx -d your-domain.com'"
echo "4. Monitor the application with 'pm2 logs whatsapp-flow' or 'pm2 monit'"

# Stop all running processes
sudo pm2 delete all
sudo killall node

# Clean up old files
cd ~
sudo rm -rf whatsapp-api
mkdir -p whatsapp-api/src/lib whatsapp-api/data whatsapp-api/.wwebjs_auth/session-whatsapp-flow

# Copy files
cp server.js whatsapp-api/
cp package.json whatsapp-api/
cp src/lib/messageQueue.js whatsapp-api/src/lib/
cp src/lib/rateLimiter.js whatsapp-api/src/lib/

# Set permissions
sudo chown -R user:user whatsapp-api
sudo chmod -R 755 whatsapp-api

# Install dependencies
cd whatsapp-api
npm install

# Start the server
sudo NODE_ENV=production PORT=3001 pm2 start server.js --name whatsapp-flow
sudo pm2 save

# Show logs
pm2 logs whatsapp-flow 