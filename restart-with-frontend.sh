#!/bin/bash
# Script to restart WhatsApp service with frontend QR code support
# This will:
# 1. Stop existing processes
# 2. Clear WhatsApp session data
# 3. Start the server with proper permissions

echo "==== WhatsApp API Restart with QR Code Support ===="

# Kill existing Node.js processes
echo "[1/4] Stopping existing processes..."
sudo pkill -9 -f node
sleep 2

# Clear session data
echo "[2/4] Clearing WhatsApp session data..."
sudo rm -rf /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth/*
sudo mkdir -p /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth
sudo chmod 777 /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth

# Set proper permissions
echo "[3/4] Setting proper permissions..."
sudo chown -R applegraphicshyd:applegraphicshyd /home/applegraphicshyd/Onnrides-WhatsApp

# Start the server
echo "[4/4] Starting WhatsApp API server..."
cd /home/applegraphicshyd/Onnrides-WhatsApp
sudo -u applegraphicshyd export DEBUG=whatsapp-web.js:* && sudo -u applegraphicshyd node src/server.js &

# Wait for server to start
sleep 5
echo "Server started in background."

# Display server status
echo ""
echo "==== Server Status ===="
ps aux | grep node | grep -v grep

echo ""
echo "==== API Endpoints ===="
echo "- GET /api/qr        (Get QR code for frontend)"
echo "- GET /api/status    (Check WhatsApp connection status)"
echo "- POST /api/send     (Send WhatsApp message)"

echo ""
echo "To check the QR code in your frontend, connect to:"
echo "http://SERVER_IP:3001/api/qr"
echo "Add the header: Authorization: Bearer onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176" 