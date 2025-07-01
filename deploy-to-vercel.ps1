# Deploy WhatsApp Flow Frontend to Vercel
Write-Host "Deploying WhatsApp Flow Frontend to Vercel..." -ForegroundColor Green

# Change to the frontend deployment directory
Set-Location -Path ".\frontend-deploy"

# Ensure dependencies are installed
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Check the URL above for your live frontend." -ForegroundColor Green

# Return to original directory
Set-Location -Path ".." 