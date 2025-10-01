#!/bin/bash

# Vercel Deployment Script for WhatsApp API Platform Frontend
# This script automates the frontend deployment process to Vercel

set -e

echo "🚀 Starting Vercel deployment for WhatsApp API Platform Frontend..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build the project locally to check for errors
echo "🔨 Building frontend locally..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Get the deployment URL
echo "🌐 Getting deployment URL..."
VERCEL_URL=$(vercel ls --scope=personal | grep whatsapp | head -1 | awk '{print $2}')

echo "✅ Frontend deployment completed successfully!"
echo "🔗 Frontend URL: https://$VERCEL_URL"
echo ""
echo "Next steps:"
echo "1. Update Railway backend CORS_ORIGIN environment variable with: https://$VERCEL_URL"
echo "2. Test the frontend by visiting: https://$VERCEL_URL"
echo "3. Register a new account and test WhatsApp session creation"
echo ""
echo "🎉 Your WhatsApp API Platform frontend is now live on Vercel!"

# Return to root directory
cd ..
