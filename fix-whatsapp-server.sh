#!/bin/bash

# Stop all Node.js processes
echo "Stopping all Node.js processes..."
pkill -f node

# Install required packages
echo "Installing required packages..."
sudo apt update
sudo apt install -y chromium-browser

# Set environment variable for Chrome path
echo "Setting Chrome path environment variable..."
echo "CHROME_BIN=$(which chromium-browser)" >> /home/applegraphicshyd/Onnrides-WhatsApp/.env

# Fix directory permissions
echo "Fixing directory permissions..."
sudo chown -R applegraphicshyd:applegraphicshyd /home/applegraphicshyd/Onnrides-WhatsApp/
sudo chmod -R 755 /home/applegraphicshyd/Onnrides-WhatsApp/

# Remove existing session data
echo "Removing existing WhatsApp session data..."
rm -rf /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth/*
mkdir -p /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth
chown -R applegraphicshyd:applegraphicshyd /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth

# Create directory for Puppeteer config
echo "Creating directory for Puppeteer config..."
mkdir -p /home/applegraphicshyd/Onnrides-WhatsApp/src/config
chown -R applegraphicshyd:applegraphicshyd /home/applegraphicshyd/Onnrides-WhatsApp/src/config

# Start the server with PM2
echo "Starting server with PM2..."
cd /home/applegraphicshyd/Onnrides-WhatsApp
pm2 delete all
sleep 2
pm2 start src/server.js --name whatsapp-api

# Check PM2 status
echo "Checking PM2 status..."
pm2 status

echo "Done! Check logs with: pm2 logs whatsapp-api" 