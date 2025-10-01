# 🚨 URGENT FIX - DOCKERFILE ERROR

## 🔴 THE PROBLEM

Render is trying to use the Dockerfile which builds BOTH frontend and backend.
We only need the BACKEND (server).

**Error**: `sh: vite: not found`

---

## ✅ THE FIX (5 MINUTES)

### OPTION 1: Delete and Recreate Service (FASTEST - RECOMMENDED)

#### STEP 1: Delete Current Service

1. Go to: https://dashboard.render.com
2. Click on: `whatsapp-api-backend`
3. Settings → Scroll down → "Delete Service"
4. Type service name to confirm
5. Click "Delete"

#### STEP 2: Create New Service (CORRECTLY)

1. **Click "New +" → "Web Service"**

2. **Select "Public Git repository"**
   - Enter: `https://github.com/apple00071/whatsapp_flow`
   - Click "Continue"

3. **CRITICAL CONFIGURATION**:

   ```
   Name: whatsapp-api-backend
   Region: Singapore
   Branch: main
   Root Directory: server          ← TYPE THIS!
   Runtime: Node                   ← SELECT "Node" NOT "Docker"!
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

   **⚠️ CRITICAL**: Make sure "Runtime" shows "Node", NOT "Docker"!

4. **Scroll down and click "Create Web Service"**

   **DO NOT add environment variables yet!**

#### STEP 3: Add Environment Variables

After service is created:

1. Click "Environment" tab
2. Click "Add Environment Variable"
3. Copy ALL from below:

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
WHATSAPP_RECONNECT_INTERVAL=5000
WHATSAPP_MAX_RECONNECT_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,application/pdf
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=1000
WEBHOOK_TIMEOUT=5000
ADMIN_EMAIL=admin@whatsapp-api.com
ADMIN_PASSWORD=Admin@123456
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
BCRYPT_ROUNDS=10
SESSION_SECRET=whatsapp-session-secret-key-production-2024-min-32-chars
LOG_LEVEL=info
LOG_FILE_PATH=./logs
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=true
ENABLE_WEBHOOKS=true
ENABLE_FILE_UPLOAD=true
ENABLE_ANALYTICS=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_TWO_FACTOR_AUTH=false
```

4. Click "Save Changes"

#### STEP 4: Wait for Deployment

1. Go to "Logs" tab
2. Watch for success messages
3. Wait 10-15 minutes
4. Status should change to "Live"

---

### OPTION 2: Fix Existing Service Settings

If you don't want to delete:

1. **Go to your service** → Settings

2. **Scroll to "Build & Deploy"**

3. **Update these fields**:
   ```
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   Docker Command: [DELETE/LEAVE EMPTY]
   ```

4. **Make sure "Runtime" is "Node"** (not Docker)

5. **Save Changes**

6. **Manual Deploy**:
   - Go to "Manual Deploy" tab
   - Click "Clear build cache & deploy"

---

## 🎯 KEY POINTS

### ✅ CORRECT Settings:

- **Runtime**: Node (NOT Docker)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### ❌ WRONG Settings:

- **Runtime**: Docker
- **Root Directory**: Empty or `.`
- **Build Command**: Using Dockerfile

---

## 🔍 HOW TO VERIFY

### In Render Dashboard:

1. Go to your service
2. Click "Settings"
3. Check "Build & Deploy" section
4. Verify:
   - ✅ Root Directory = `server`
   - ✅ Build Command = `npm install`
   - ✅ Start Command = `npm start`
   - ✅ Runtime = Node

### In Logs:

Look for:
```
✅ Entering directory: server
✅ Running 'npm install'
✅ Running 'npm start'
✅ Server is running on port 10000
```

NOT:
```
❌ Building Dockerfile
❌ sh: vite: not found
```

---

## ⏱️ TIMELINE

| Step | Time |
|------|------|
| Delete old service | 1 min |
| Create new service | 2 min |
| Add env variables | 5 min |
| Deployment | 10-15 min |
| **TOTAL** | **~20 min** |

---

## 🚀 DO THIS NOW

1. **Go to**: https://dashboard.render.com
2. **Delete**: Current service
3. **Create**: New service with settings above
4. **Add**: All environment variables
5. **Wait**: For deployment
6. **Test**: Health endpoint

---

## ✅ SUCCESS CRITERIA

After fix:

✅ Service deploys successfully
✅ No Dockerfile errors
✅ No "vite: not found" errors
✅ Backend running on port 10000
✅ Health endpoint responds
✅ Ready to connect frontend

---

## 📞 NEXT STEPS

After backend is deployed:

1. Copy backend URL
2. Update Vercel environment variables
3. Redeploy frontend
4. Test registration

See: `FIX_FRONTEND_LOCALHOST_ISSUE.md`

---

**🎯 DELETE AND RECREATE SERVICE NOW WITH CORRECT SETTINGS!**
