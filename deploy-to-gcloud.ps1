# WhatsApp Flow Backend Deployment Script for Google Cloud
# This script deploys the backend to the Google Cloud VM

# VM details
$VM_NAME = "instance-20250629-160141"
$ZONE = "us-central1-f"  # VM location from the image
$PROJECT = "whatsapp-api-464415"  # Project ID where VM is located

# Prompt for VM name if needed
$VM_NAME_INPUT = Read-Host -Prompt "Enter your VM instance name (default: instance-20250629-160141)"
if (![string]::IsNullOrEmpty($VM_NAME_INPUT)) {
    $VM_NAME = $VM_NAME_INPUT
}

# Prompt for zone if needed
$ZONE_INPUT = Read-Host -Prompt "Enter your VM zone (default: us-central1-f)"
if (![string]::IsNullOrEmpty($ZONE_INPUT)) {
    $ZONE = $ZONE_INPUT
}

# Set the correct project
Write-Host "Setting project to $PROJECT..." -ForegroundColor Yellow
gcloud config set project $PROJECT

Write-Host "Deploying backend to VM $VM_NAME in zone $ZONE..." -ForegroundColor Green

# Copy server.js to VM
Write-Host "Copying server.js to VM..." -ForegroundColor Yellow
gcloud compute scp server.js $VM_NAME`:~/whatsapp-flow/ --zone=$ZONE

# Copy fix-backend.sh to VM
Write-Host "Copying fix-backend.sh to VM..." -ForegroundColor Yellow
gcloud compute scp fix-backend.sh $VM_NAME`:~/whatsapp-flow/ --zone=$ZONE

# Copy src/lib directory if it exists
if (Test-Path -Path "src/lib") {
    Write-Host "Copying library files to VM..." -ForegroundColor Yellow
    gcloud compute ssh $VM_NAME --zone=$ZONE --command="mkdir -p ~/whatsapp-flow/src/lib"
    gcloud compute scp src/lib/messageQueue.js $VM_NAME`:~/whatsapp-flow/src/lib/ --zone=$ZONE
    gcloud compute scp src/lib/rateLimiter.js $VM_NAME`:~/whatsapp-flow/src/lib/ --zone=$ZONE
}

# Run fix-backend.sh on VM
Write-Host "Running fix-backend.sh on VM..." -ForegroundColor Yellow
gcloud compute ssh $VM_NAME --zone=$ZONE --command="cd ~/whatsapp-flow && chmod +x fix-backend.sh && bash fix-backend.sh"

Write-Host "Backend deployment completed!" -ForegroundColor Green
Write-Host "Check the status with: gcloud compute ssh $VM_NAME --zone=$ZONE --command='pm2 status'" -ForegroundColor Cyan 