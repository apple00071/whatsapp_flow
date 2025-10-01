# 🚀 Automated Deployment Guide

## Overview

This repository is now configured for automated deployment to Railway (backend) and Vercel (frontend). All configuration files and environment variables have been pre-configured.

## 🔧 Pre-Configured Files

### Railway Configuration
- ✅ `railway.toml` - Railway service configuration
- ✅ `Dockerfile` - Container configuration
- ✅ `package.json` - Root package.json for Railway
- ✅ `scripts/deploy-railway.sh` - Automated deployment script

### Vercel Configuration
- ✅ `vercel.json` - Vercel build and routing configuration
- ✅ `scripts/deploy-vercel.sh` - Automated deployment script

### Environment Configuration
- ✅ `server/.env` - Updated with Supabase credentials
- ✅ `server/.env.example` - Template with production values

## 🎯 Deployment Options

### Option 1: Automated CLI Deployment (Recommended)

**Prerequisites:**
- Node.js 18+ installed
- Git repository access

**Steps:**

1. **Deploy Backend to Railway:**
   ```bash
   chmod +x scripts/deploy-railway.sh
   ./scripts/deploy-railway.sh
   ```

2. **Deploy Frontend to Vercel:**
   ```bash
   chmod +x scripts/deploy-vercel.sh
   ./scripts/deploy-vercel.sh
   ```

### Option 2: Manual Dashboard Deployment

**Railway (Backend):**
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `apple00071/whatsapp_flow`
5. Railway will auto-detect configuration from `railway.toml`
6. Add Redis service: "New" → "Database" → "Redis"
7. Set `DB_PASSWORD` environment variable with your Supabase password
8. Deploy

**Vercel (Frontend):**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `apple00071/whatsapp_flow`
5. Vercel will auto-detect configuration from `vercel.json`
6. Update `VITE_API_URL` with your Railway backend URL
7. Deploy

## 🔑 Required Manual Configuration

### 1. Supabase Database Password

You need to set your actual Supabase database password in Railway:

1. Go to your Supabase dashboard
2. Project Settings → Database
3. Copy your database password
4. In Railway, set environment variable:
   ```
   DB_PASSWORD=your-actual-supabase-password
   DATABASE_URL=postgresql://postgres:your-actual-supabase-password@db.frifbegpqtxllisfmfmw.supabase.co:5432/postgres
   ```

### 2. CORS Configuration

After both deployments:

1. Get your Vercel frontend URL
2. Update Railway backend environment variable:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```

## 📊 Pre-Configured Environment Variables

### Railway (Backend) - Already Set in railway.toml:
```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://frifbegpqtxllisfmfmw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DB_HOST=db.frifbegpqtxllisfmfmw.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
JWT_SECRET=whatsapp-api-super-secret-jwt-key-production-2024-min-32-chars
REFRESH_TOKEN_SECRET=whatsapp-api-refresh-token-secret-production-2024-min-32-chars
# ... and 30+ more variables
```

### Vercel (Frontend) - Already Set in vercel.json:
```bash
VITE_API_URL=https://whatsapp-api-backend-production.up.railway.app
VITE_WS_URL=wss://whatsapp-api-backend-production.up.railway.app
```

## 🗄️ Database Setup

The deployment scripts will automatically:
1. Run database migrations: `npm run db:migrate`
2. Seed test data: `npm run db:seed`

## 🧪 Testing Deployment

After deployment, test these features:

### Backend Health Check
```bash
curl https://your-backend.up.railway.app/health
```

### API Documentation
Visit: `https://your-backend.up.railway.app/api/docs`

### Frontend Access
Visit: `https://your-app.vercel.app`

### Full Platform Test
1. Register a new account
2. Create WhatsApp session
3. Display QR code (tests qrcode.react dependency)
4. Scan with WhatsApp
5. Send test message

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Failed:**
```bash
# Check Supabase password is set correctly
railway variables get DB_PASSWORD
```

**Redis Connection Failed:**
```bash
# Ensure Redis service is added
railway services
```

**Build Failed:**
```bash
# Check build logs
railway logs
```

### Frontend Issues

**API Connection Failed:**
```bash
# Check backend URL is correct
vercel env ls
```

**Build Failed:**
```bash
# Check dependencies
cd client && npm install
```

## 📈 Monitoring

### Railway Monitoring
- Dashboard: https://railway.app/dashboard
- Usage: Monitor $5/month free credit
- Logs: Real-time application logs

### Vercel Monitoring
- Dashboard: https://vercel.com/dashboard
- Analytics: Built-in traffic analytics
- Bandwidth: Monitor 100GB/month limit

## 🔄 Auto-Deployment

Both platforms are configured for auto-deployment:

- **Railway**: Deploys on push to `main` branch
- **Vercel**: Deploys on push to `main` branch

## 🎯 Expected Deployment Time

- **Railway Backend**: 3-5 minutes
- **Vercel Frontend**: 2-3 minutes
- **Total Setup**: 10-15 minutes

## 🎉 Success Indicators

After successful deployment:

✅ Backend responds at Railway URL
✅ API docs accessible
✅ Frontend loads at Vercel URL
✅ User registration works
✅ WhatsApp session creation works
✅ QR codes display correctly
✅ Real-time features work

## 📞 Support

If deployment fails:

1. Check the troubleshooting section
2. Review platform-specific logs
3. Verify environment variables
4. Ensure Supabase is accessible
5. Check GitHub repository permissions

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repository**: https://github.com/apple00071/whatsapp_flow

---

**The repository is now deployment-ready! 🚀**

All configuration files are in place, environment variables are pre-configured, and deployment scripts are ready to use.
