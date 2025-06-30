#!/bin/bash
# Script to check WhatsApp API status and retrieve QR code

echo "==== WhatsApp API Status Check ===="
echo "This script will check the status of the WhatsApp API and retrieve the QR code."

# Connect to the VM
echo "Connecting to the VM..."
gcloud compute ssh whatsapp-api-instance --zone=us-central1-c --command="
  echo 'Checking WhatsApp API status...'
  curl -s http://localhost:3001/api/status | jq .
  
  echo 'Checking if QR code is available...'
  if [ -f /tmp/whatsapp-qr.js ]; then
    echo 'QR code generator script is available.'
    echo 'To generate a QR code, please run this command:'
    echo 'cd /home/user/whatsapp-api && node /tmp/whatsapp-qr.js'
  else
    echo 'QR code generator not found. You may need to run the fix script first.'
  fi
  
  echo 'Checking running processes...'
  ps aux | grep -i node | grep -v grep
  
  echo 'Checking WhatsApp authentication directory...'
  ls -la /home/user/whatsapp-api/.wwebjs_auth/ 2>/dev/null || echo 'Authentication directory not found.'
" 