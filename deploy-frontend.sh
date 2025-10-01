#!/bin/bash

# Quick Frontend Deployment Script
# This script deploys ONLY the frontend to Vercel

echo "🚀 Deploying Frontend to Vercel..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building frontend..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel dist --prod --yes

echo "✅ Frontend deployment completed!"
echo "🔗 Check your Vercel dashboard for the deployment URL"
