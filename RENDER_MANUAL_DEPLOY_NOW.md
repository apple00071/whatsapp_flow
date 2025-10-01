# 🚀 RENDER.COM MANUAL DEPLOYMENT - FASTEST METHOD

## ⚡ THIS METHOD BYPASSES GITHUB CONNECTION ISSUES

No need to connect GitHub repository! Deploy directly from your local code.

---

## 📋 PREREQUISITES

- [x] Render.com account (sign up at https://render.com)
- [x] Local code ready in `d:\whatsapp api`
- [x] Git installed on your machine

---

## 🚀 DEPLOYMENT STEPS

### STEP 1: Install Render CLI

Open PowerShell and run:

```powershell
npm install -g @render/cli
```

### STEP 2: Login to Render

```powershell
render login
```

This will open a browser window. Login with your Render account.

### STEP 3: Navigate to Server Directory

```powershell
cd "d:\whatsapp api\server"
```

### STEP 4: Create render.yaml in Server Directory

We need a render.yaml specifically for the server folder.

Create file: `server/render.yaml`

```yaml
services:
  - type: web
    name: whatsapp-api-backend
    env: node
    region: singapore
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: API_VERSION
        value: v1
      - key: DATABASE_URL
        value: postgresql://postgres:hC6gdcJ$fr*$PUv@db.frifbegpqtxllisfmfmw.supabase.co:5432/postgres
      - key: DB_HOST
        value: db.frifbegpqtxllisfmfmw.supabase.co
      - key: DB_PORT
        value: 5432
      - key: DB_NAME
        value: postgres
      - key: DB_USER
        value: postgres
      - key: DB_PASSWORD
        value: hC6gdcJ$fr*$PUv
      - key: DB_POOL_MIN
        value: 2
      - key: DB_POOL_MAX
        value: 10
      - key: SUPABASE_URL
        value: https://frifbegpqtxllisfmfmw.supabase.co
      - key: SUPABASE_ANON_KEY
        value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWZiZWdwcXR4bGxpc2ZtZm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTI2NzAsImV4cCI6MjA3NDgyODY3MH0.qccbNgLHBzpx8gqPuB7Vdr9Ditmvd5kHxFvBmS1qj_M
      - key: SUPABASE_SERVICE_ROLE_KEY
        value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWZiZWdwcXR4bGxpc2ZtZm13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1MjY3MCwiZXhwIjoyMDc0ODI4NjcwfQ.u5s6MmlpsiIgMFJu2y-nws8u1sXYqqvkFx1np1D1CeA
      - key: REDIS_URL
        value: redis://default:o7yWxZ0qqGR5gWqVOX8OTGXD24XROBWg@redis-13390.crce217.ap-south-1-1.ec2.redns.redis-cloud.com:13390
      - key: REDIS_HOST
        value: redis-13390.crce217.ap-south-1-1.ec2.redns.redis-cloud.com
      - key: REDIS_PORT
        value: 13390
      - key: REDIS_PASSWORD
        value: o7yWxZ0qqGR5gWqVOX8OTGXD24XROBWg
      - key: REDIS_DB
        value: 0
      - key: JWT_SECRET
        value: whatsapp-api-super-secret-jwt-key-production-2024-min-32-chars
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: REFRESH_TOKEN_SECRET
        value: whatsapp-api-refresh-token-secret-production-2024-min-32-chars
      - key: REFRESH_TOKEN_EXPIRES_IN
        value: 30d
      - key: CORS_ORIGIN
        value: https://dist-eta-sootyvercel.app
      - key: CORS_CREDENTIALS
        value: true
      - key: WHATSAPP_SESSION_PATH
        value: ./sessions
      - key: WHATSAPP_MAX_SESSIONS
        value: 50
      - key: WHATSAPP_TIMEOUT
        value: 60000
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 100
      - key: MAX_FILE_SIZE
        value: 10485760
      - key: UPLOAD_PATH
        value: ./uploads
      - key: ADMIN_EMAIL
        value: admin@whatsapp-api.com
      - key: ADMIN_PASSWORD
        value: Admin@123456
      - key: BCRYPT_ROUNDS
        value: 10
      - key: LOG_LEVEL
        value: info
      - key: ENABLE_SWAGGER
        value: true
```

### STEP 5: Deploy Using Render CLI

```powershell
render deploy
```

Wait 10-15 minutes for deployment to complete.

---

## ✅ ALTERNATIVE: DEPLOY VIA RENDER DASHBOARD (NO GITHUB)

If CLI doesn't work, use this method:

### Method 1: Create Service Manually

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Select "Build and deploy from a Git repository"**
   - Click "Public Git repository"
   - Enter: `https://github.com/apple00071/whatsapp_flow`
   - Click "Continue"

4. **Configure Service**
   - **Name**: `whatsapp-api-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Click "Create Web Service"

5. **Add Environment Variables**
   - After service is created, go to "Environment" tab
   - Click "Add Environment Variable"
   - Add each variable from the list below

---

## 📝 ENVIRONMENT VARIABLES TO ADD

Copy these EXACTLY into Render dashboard (Environment tab):

```
NODE_ENV=production
PORT=10000
API_VERSION=v1
DATABASE_URL=postgresql://postgres:hC6gdcJ$fr*$PUv@db.frifbegpqtxllisfmfmw.supabase.co:5432/postgres
DB_HOST=db.frifbegpqtxllisfmfmw.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=hC6gdcJ$fr*$PUv
DB_POOL_MIN=2
DB_POOL_MAX=10
SUPABASE_URL=https://frifbegpqtxllisfmfmw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWZiZWdwcXR4bGxpc2ZtZm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTI2NzAsImV4cCI6MjA3NDgyODY3MH0.qccbNgLHBzpx8gqPuB7Vdr9Ditmvd5kHxFvBmS1qj_M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWZiZWdwcXR4bGxpc2ZtZm13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1MjY3MCwiZXhwIjoyMDc0ODI4NjcwfQ.u5s6MmlpsiIgMFJu2y-nws8u1sXYqqvkFx1np1D1CeA
REDIS_URL=redis://default:o7yWxZ0qqGR5gWqVOX8OTGXD24XROBWg@redis-13390.crce217.ap-south-1-1.ec2.redns.redis-cloud.com:13390
REDIS_HOST=redis-13390.crce217.ap-south-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=13390
REDIS_PASSWORD=o7yWxZ0qqGR5gWqVOX8OTGXD24XROBWg
REDIS_DB=0
JWT_SECRET=whatsapp-api-super-secret-jwt-key-production-2024-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=whatsapp-api-refresh-token-secret-production-2024-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=https://dist-eta-sootyvercel.app
CORS_CREDENTIALS=true
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_MAX_SESSIONS=50
WHATSAPP_TIMEOUT=60000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ADMIN_EMAIL=admin@whatsapp-api.com
ADMIN_PASSWORD=Admin@123456
BCRYPT_ROUNDS=10
LOG_LEVEL=info
ENABLE_SWAGGER=true
```

6. **Click "Save Changes"**
   - Render will automatically redeploy

---

## 🔍 VERIFY DEPLOYMENT

### Get Your Backend URL

After deployment completes, you'll see your URL in the Render dashboard:
```
https://whatsapp-api-backend.onrender.com
```

### Test Health Endpoint

```powershell
curl https://whatsapp-api-backend.onrender.com/api/v1/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-01T..."}
```

---

## ⏱️ EXPECTED TIMELINE

- CLI installation: 1 min
- Service creation: 2 min
- Environment variables: 5 min
- Deployment: 10-15 min
- **TOTAL: ~20 minutes**

---

**NEXT: Update frontend environment variables (see PART 2)**
