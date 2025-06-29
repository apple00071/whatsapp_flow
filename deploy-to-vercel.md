# Deploying WhatsApp Flow Frontend to Vercel

This guide will help you deploy the frontend portion of WhatsApp Flow to Vercel while keeping the backend server running on your Google Cloud VM.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com if you don't have one)
2. Vercel CLI installed (optional, for command-line deployment)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign in to your account
2. Click "Add New..." > "Project"
3. Import your GitHub repository (https://github.com/apple00071/whatsapp_flow)
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
5. Add the following environment variable:
   - NEXT_PUBLIC_API_URL: http://34.45.239.220:3001
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. Follow the prompts and specify the environment variable:
   - NEXT_PUBLIC_API_URL: http://34.45.239.220:3001

## Backend Configuration

To ensure your backend on the VM accepts requests from your Vercel-hosted frontend, you need to update the CORS configuration in your server.js file:

```javascript
// CORS configuration
server.use(cors({
  origin: ['https://your-vercel-domain.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
```

Replace `your-vercel-domain.vercel.app` with your actual Vercel domain after deployment.

## Accessing Your Application

After deployment, you can access your application at the Vercel URL provided (typically something like `https://whatsapp-flow-xyz123.vercel.app`).

The frontend will communicate with your backend server running on the VM at http://34.45.239.220:3001.

## Important Notes

1. Make sure your VM's firewall allows incoming connections on port 3001
2. For a production environment, consider setting up a proper domain name and SSL certificate for your backend
3. Update the CORS configuration on your backend to accept requests from your Vercel domain 