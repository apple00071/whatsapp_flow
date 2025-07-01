# Deploy Frontend to Vercel
Write-Host "Deploying WhatsApp Flow Frontend to Vercel..."

# Change to frontend directory
Set-Location -Path ".\clean-frontend"

# Ensure dependencies are installed
Write-Host "Installing dependencies..."
npm install

# Build the project
Write-Host "Building project..."
npm run build

# Deploy to Vercel
Write-Host "Deploying to Vercel..."
vercel --prod

Write-Host "Deployment complete! Check the URL above for your live frontend."

# Return to original directory
Set-Location -Path ".." 