#!/bin/bash
# Script to restart the WhatsApp API service

echo "==== Restarting WhatsApp API Service ===="

# Stop any existing Node.js processes
echo "Stopping existing processes..."
sudo pkill -9 -f node

# Clear session data
echo "Clearing session data..."
sudo rm -rf /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth/*
sudo mkdir -p /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth
sudo chown -R applegraphicshyd:applegraphicshyd /home/applegraphicshyd/Onnrides-WhatsApp/.wwebjs_auth

# Start the service
echo "Starting the service..."
cd /home/applegraphicshyd/Onnrides-WhatsApp
sudo -u applegraphicshyd node src/server.js 