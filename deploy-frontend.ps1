# Quick Frontend Deployment Script for Windows PowerShell
# This script deploys ONLY the frontend to Vercel

Write-Host "🚀 Deploying Frontend to Vercel..." -ForegroundColor Green

# Navigate to client directory
Set-Location client

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the project
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
vercel dist --prod --yes

Write-Host "✅ Frontend deployment completed!" -ForegroundColor Green
Write-Host "🔗 Check your Vercel dashboard for the deployment URL" -ForegroundColor Cyan
