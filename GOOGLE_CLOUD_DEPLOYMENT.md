# Google Cloud VM Backend Deployment Guide

This guide will help you deploy the WhatsApp Flow backend to your Google Cloud VM and troubleshoot any issues.

## Prerequisites

- Google Cloud VM running Ubuntu 20.04 or later
- SSH access to your VM
- Domain name (optional, for production)

## Step 1: Connect to Your VM

```bash
# Connect via SSH (replace with your VM's external IP)
ssh your-username@YOUR_VM_EXTERNAL_IP
```

## Step 2: Update System and Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Google Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb

# Install Redis (optional, for production)
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

## Step 3: Clone and Setup the Project

```bash
# Clone the repository
git clone https://github.com/apple00071/whatsapp_flow.git
cd whatsapp_flow

# Make scripts executable
chmod +x start-backend.sh
chmod +x troubleshoot-backend.js
```

## Step 4: Run Troubleshooting Script

```bash
# Run the troubleshooting script to check your setup
node troubleshoot-backend.js
```

This will:
- Check if all required software is installed
- Verify directory structure
- Check environment configuration
- Test dependencies
- Generate a fix script if needed

## Step 5: Start the Backend

```bash
# Run the startup script
./start-backend.sh
```

## Step 6: Verify the Deployment

```bash
# Check if PM2 processes are running
pm2 list

# Check logs
pm2 logs whatsapp-flow --lines 20

# Test the API locally
curl http://localhost:3001/api/whatsapp/status

# Test from external IP (replace with your VM's IP)
curl http://YOUR_VM_EXTERNAL_IP:3001/api/whatsapp/status
```

## Step 7: Configure Firewall

### Google Cloud Firewall Rules

1. Go to Google Cloud Console
2. Navigate to VPC Network > Firewall
3. Create a new firewall rule:
   - Name: `whatsapp-flow-backend`
   - Network: `default`
   - Priority: `1000`
   - Direction: `Ingress`
   - Action: `Allow`
   - Targets: `All instances in the network`
   - Source IP ranges: `0.0.0.0/0` (or restrict to your needs)
   - Protocols and ports: `tcp:3001`

### Local Firewall (UFW)

```bash
# Allow port 3001
sudo ufw allow 3001/tcp

# Enable UFW if not already enabled
sudo ufw enable

# Check status
sudo ufw status
```

## Step 8: Update Frontend Configuration

In your Vercel deployment, make sure the environment variable is set correctly:

```
NEXT_PUBLIC_API_URL=http://YOUR_VM_EXTERNAL_IP:3001
```

## Troubleshooting Common Issues

### Issue 1: Server Won't Start

```bash
# Check PM2 status
pm2 list

# Check logs for errors
pm2 logs whatsapp-flow

# Restart the process
pm2 restart whatsapp-flow

# If still failing, try a fresh start
pm2 delete all
./start-backend.sh
```

### Issue 2: Port Already in Use

```bash
# Check what's using port 3001
sudo netstat -tlnp | grep :3001

# Kill the process if needed
sudo pkill -f "node.*server.js"

# Or change the port in .env file
echo "PORT=3002" >> .env
```

### Issue 3: Chrome/Chromium Issues

```bash
# Check if Chrome is installed
google-chrome --version

# If not installed, install it
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb
```

### Issue 4: Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
chmod 666 data/*.json 2>/dev/null || true
```

### Issue 5: Memory Issues

```bash
# Check available memory
free -h

# If low memory, add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
pm2 logs whatsapp-flow -f

# Last 50 lines
pm2 logs whatsapp-flow --lines 50

# Error logs only
pm2 logs whatsapp-flow --err --lines 20
```

### Restart Services

```bash
# Restart the application
pm2 restart whatsapp-flow

# Restart PM2 daemon
pm2 resurrect

# Update PM2 startup script
pm2 startup
pm2 save
```

### Update the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Restart the application
pm2 restart whatsapp-flow
```

## Security Considerations

1. **Change default JWT secret** in the `.env` file
2. **Restrict firewall rules** to only necessary IPs
3. **Use HTTPS** in production (set up SSL certificate)
4. **Regular updates** of system packages
5. **Monitor logs** for suspicious activity

## Testing the Complete Setup

1. **Backend API Test**:
   ```bash
   curl http://YOUR_VM_EXTERNAL_IP:3001/api/whatsapp/status
   ```

2. **Frontend Connection Test**:
   - Open your Vercel app
   - Check if it can connect to the backend
   - Try scanning the QR code

3. **Message Test**:
   - Send a test message through the frontend
   - Check if it appears in WhatsApp

## Support Commands

```bash
# Quick status check
pm2 list && curl -s http://localhost:3001/api/whatsapp/status | jq .

# Full system check
node troubleshoot-backend.js

# Emergency restart
pm2 delete all && ./start-backend.sh
```

## Next Steps

1. **Set up SSL** for production use
2. **Configure domain** pointing to your VM
3. **Set up monitoring** and alerts
4. **Regular backups** of session data
5. **Performance optimization** based on usage

If you're still having issues after following this guide, run the troubleshooting script and share the output for further assistance. 