# WhatsApp Flow Backend Deployment Script
# This script deploys the backend to the VM

# VM connection details
$VM_USER = "your_vm_username"
$VM_IP = "34.45.239.220"
$SSH_KEY_PATH = "path/to/your/private_key"

# Prompt for VM username if not set
if ($VM_USER -eq "your_vm_username") {
    $VM_USER = Read-Host -Prompt "Enter VM username"
}

# Prompt for SSH key path if not set
if ($SSH_KEY_PATH -eq "path/to/your/private_key") {
    $SSH_KEY_PATH = Read-Host -Prompt "Enter path to your SSH private key"
}

Write-Host "Deploying backend to VM at $VM_IP..." -ForegroundColor Green

# Copy server.js to VM
Write-Host "Copying server.js to VM..." -ForegroundColor Yellow
ssh -i $SSH_KEY_PATH "$VM_USER@$VM_IP" "mkdir -p ~/whatsapp-flow"
scp -i $SSH_KEY_PATH server.js "$VM_USER@$VM_IP`:~/whatsapp-flow/"

# Copy fix-backend.sh to VM
Write-Host "Copying fix-backend.sh to VM..." -ForegroundColor Yellow
scp -i $SSH_KEY_PATH fix-backend.sh "$VM_USER@$VM_IP`:~/whatsapp-flow/"

# Copy message queue and rate limiter files
Write-Host "Copying library files to VM..." -ForegroundColor Yellow
ssh -i $SSH_KEY_PATH "$VM_USER@$VM_IP" "mkdir -p ~/whatsapp-flow/src/lib"
scp -i $SSH_KEY_PATH src/lib/messageQueue.js "$VM_USER@$VM_IP`:~/whatsapp-flow/src/lib/"
scp -i $SSH_KEY_PATH src/lib/rateLimiter.js "$VM_USER@$VM_IP`:~/whatsapp-flow/src/lib/"

# Run fix-backend.sh on VM
Write-Host "Running fix-backend.sh on VM..." -ForegroundColor Yellow
ssh -i $SSH_KEY_PATH "$VM_USER@$VM_IP" "cd ~/whatsapp-flow && chmod +x fix-backend.sh && bash fix-backend.sh"

Write-Host "Backend deployment completed!" -ForegroundColor Green
Write-Host "Check the status with: ssh -i $SSH_KEY_PATH $VM_USER@$VM_IP 'pm2 status'" -ForegroundColor Cyan 