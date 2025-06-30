#!/bin/bash
# Script to restart the WhatsApp API service with debugging enabled
# Author: Claude AI

# Path to the WhatsApp directory
WHATSAPP_DIR="/home/applegraphicshyd/Onnrides-WhatsApp"

# Stop all running node processes
echo "Stopping all Node.js processes..."
pkill -9 -f node
sleep 2

# Reload environment variables
echo "Loading environment from .env file..."
source $WHATSAPP_DIR/.env
echo "API_KEY = $API_KEY"

# Clear previous session data
echo "Clearing previous WhatsApp session data..."
rm -rf $WHATSAPP_DIR/.wwebjs_auth/*
mkdir -p $WHATSAPP_DIR/.wwebjs_auth
chmod 777 $WHATSAPP_DIR/.wwebjs_auth

# Enable debugging
echo "Enabling WhatsApp debug mode..."
export DEBUG=whatsapp-web.js:*

# Start the server
echo "Starting WhatsApp API server with QR code generation..."
echo "=== IMPORTANT: SCAN THE QR CODE THAT APPEARS BELOW WITH YOUR WHATSAPP APP ==="
echo "=== Open WhatsApp > Settings > Linked Devices > Link a Device ==="
cd $WHATSAPP_DIR
chmod 666 $WHATSAPP_DIR/src/server.js
su - applegraphicshyd -c "cd $WHATSAPP_DIR && DEBUG=whatsapp-web.js:* node src/server.js" 