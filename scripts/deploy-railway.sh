#!/bin/bash

# Railway Deployment Script for WhatsApp API Platform
# This script automates the deployment process to Railway

set -e

echo "🚀 Starting Railway deployment for WhatsApp API Platform..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

# Create or link to Railway project
echo "🔗 Setting up Railway project..."
if [ ! -f ".railway" ]; then
    echo "Creating new Railway project..."
    railway init
else
    echo "Using existing Railway project..."
fi

# Deploy the backend service
echo "📦 Deploying backend service..."
railway up --service backend

# Add Redis service if not exists
echo "🔴 Setting up Redis service..."
railway add redis || echo "Redis service already exists"

# Set environment variables
echo "⚙️ Setting environment variables..."

# Production environment
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Supabase configuration
railway variables set SUPABASE_URL=https://frifbegpqtxllisfmfmw.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWZiZWdwcXR4bGxpc2ZtZm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTI2NzAsImV4cCI6MjA3NDgyODY3MH0.qccbNgLHBzpx8gqPuB7Vdr9Ditmvd5kHxFvBmS1qj_M
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWZiZWdwcXR4bGxpc2ZtZm13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1MjY3MCwiZXhwIjoyMDc0ODI4NjcwfQ.u5s6MmlpsiIgMFJu2y-nws8u1sXYqqvkFx1np1D1CeA

# Database configuration
railway variables set DB_HOST=db.frifbegpqtxllisfmfmw.supabase.co
railway variables set DB_PORT=5432
railway variables set DB_NAME=postgres
railway variables set DB_USER=postgres

# JWT secrets
railway variables set JWT_SECRET=whatsapp-api-super-secret-jwt-key-production-2024-min-32-chars
railway variables set REFRESH_TOKEN_SECRET=whatsapp-api-refresh-token-secret-production-2024-min-32-chars

# WhatsApp configuration
railway variables set WHATSAPP_SESSION_PATH=./sessions
railway variables set WHATSAPP_MAX_SESSIONS=50

# CORS configuration
railway variables set CORS_ORIGIN=*
railway variables set CORS_CREDENTIALS=true

# Run database migrations
echo "🗄️ Running database migrations..."
railway run npm run db:migrate

# Seed database (optional)
echo "🌱 Seeding database..."
railway run npm run db:seed || echo "Seeding failed or already done"

# Get the deployment URL
echo "🌐 Getting deployment URL..."
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url')

echo "✅ Deployment completed successfully!"
echo "🔗 Backend URL: $RAILWAY_URL"
echo "📚 API Documentation: $RAILWAY_URL/api/docs"
echo ""
echo "Next steps:"
echo "1. Update Vercel frontend environment variables with this backend URL"
echo "2. Update CORS_ORIGIN in Railway to match your Vercel frontend URL"
echo "3. Test the deployment by visiting the URLs above"
echo ""
echo "🎉 Your WhatsApp API Platform backend is now live on Railway!"
