# 🎯 RENDER DEPLOYMENT - STEP BY STEP WITH VISUAL GUIDE

## 🚨 CRITICAL ISSUE

You're getting the Dockerfile error because Render is using **Docker runtime** instead of **Node runtime**.

**Error**: `sh: vite: not found` - This happens when Render tries to build the frontend using the Dockerfile.

**Solution**: Delete service and recreate with **Node runtime** (NOT Docker).

---

## ⚡ STEP-BY-STEP GUIDE

### PART 1: DELETE CURRENT SERVICE

#### Step 1.1: Go to Render Dashboard

1. Open browser
2. Go to: https://dashboard.render.com
3. Login if needed

#### Step 1.2: Find Your Service

1. You'll see a list of services
2. Find: `whatsapp-api-backend` (or whatever you named it)
3. Click on it

#### Step 1.3: Delete Service

1. On the service page, look at the **left sidebar**
2. Click "**Settings**" (near the bottom)
3. Scroll **ALL THE WAY DOWN** to the bottom of the page
4. You'll see a red button: "**Delete Service**"
5. Click it
6. Type the service name to confirm
7. Click "**Delete**"

**Service is now deleted!** ✅

---

### PART 2: CREATE NEW SERVICE (CORRECTLY)

#### Step 2.1: Start Creating Service

1. You're back at the dashboard
2. Look at the **top right corner**
3. Click the blue "**New +**" button
4. Click "**Web Service**"

#### Step 2.2: Connect Repository

You'll see a screen with options:

1. Look for "**Public Git repository**" option
2. You'll see a text input box
3. Paste this EXACTLY:
   ```
   https://github.com/apple00071/whatsapp_flow
   ```
4. Click "**Continue**" button

**Wait a few seconds while Render analyzes the repository...**

#### Step 2.3: Configure Service (MOST IMPORTANT!)

You'll now see a configuration form. **THIS IS WHERE MOST PEOPLE MAKE MISTAKES!**

**Fill in EXACTLY as shown**:

```
┌─────────────────────────────────────────────────────┐
│ Name                                                │
│ ┌─────────────────────────────────────────────────┐ │
│ │ whatsapp-api-backend                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Region                                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Singapore (or closest to you)                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Branch                                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ main                                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Root Directory                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ server                    ← TYPE THIS!          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Environment                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Node                      ← SELECT THIS!        │ │
│ │ (NOT Docker!)                                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Build Command                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ npm install                                     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Start Command                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ npm start                                       │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Instance Type                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Free                                            │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**⚠️ CRITICAL POINTS**:

1. **Root Directory**: MUST be `server` (not empty, not `.`)
2. **Environment**: MUST be `Node` (NOT Docker, NOT Static Site)
3. **Build Command**: MUST be `npm install` (not `npm ci`, not `npm run build`)
4. **Start Command**: MUST be `npm start`

#### Step 2.4: Create Service

1. Scroll down
2. Click the blue "**Create Web Service**" button
3. **WAIT!** Don't close the page!

**Render will start creating the service...**

You'll see a message like: "Creating service..." or "Deploying..."

**⚠️ IMPORTANT**: The first deployment will **FAIL** because we haven't added environment variables yet. **This is normal!**

---

### PART 3: ADD ENVIRONMENT VARIABLES

#### Step 3.1: Go to Environment Tab

1. You're now on the service page
2. Look at the **left sidebar**
3. Click "**Environment**"

#### Step 3.2: Add Variables

You'll see a page with environment variables.

1. Click the blue "**Add Environment Variable**" button

2. You'll see two input fields:
   - **Key**: Variable name
   - **Value**: Variable value

3. **Open the file**: `RENDER_ENV_VARS_COPY_PASTE.txt`

4. **Copy the FIRST line**: `NODE_ENV=production`

5. **Split it**:
   - Key: `NODE_ENV`
   - Value: `production`

6. Click "**Add**" or "**Save**"

7. **Repeat for ALL variables** in the file

**TIP**: You can add multiple variables before saving. Look for a "Bulk Edit" or "Add Multiple" option if available.

#### Step 3.3: Save All Variables

1. After adding all variables, click "**Save Changes**"
2. Render will ask: "This will trigger a new deployment. Continue?"
3. Click "**Yes**" or "**Save Changes**"

**Render will now redeploy with the environment variables!**

---

### PART 4: MONITOR DEPLOYMENT

#### Step 4.1: Go to Logs

1. Look at the **left sidebar**
2. Click "**Logs**"

#### Step 4.2: Watch for Success Messages

You should see logs like this:

```
==> Cloning from https://github.com/apple00071/whatsapp_flow...
==> Checking out commit abc123 in branch main
==> Entering directory: server          ← GOOD! Using server directory
==> Running 'npm install'                ← GOOD! Not using Dockerfile
added 559 packages in 14s
==> Running 'npm start'                  ← GOOD! Starting server
✅ Connecting to Redis using REDIS_URL
✅ Redis client connected
✅ Redis client ready
✅ Database connection established successfully
✅ Database synchronized successfully
✅ Server is running on port 10000
```

**⚠️ If you see**:
```
❌ Building Dockerfile
❌ sh: vite: not found
```

**Then you selected Docker runtime instead of Node!** Go back to Part 2 and recreate the service.

#### Step 4.3: Wait for "Live" Status

1. At the top of the page, you'll see the status
2. It will change from:
   - "Building..." → "Deploying..." → "Live" ✅

3. **Wait 10-15 minutes** for the first deployment

#### Step 4.4: Get Your Backend URL

1. Once status is "**Live**", look at the top of the page
2. You'll see your URL:
   ```
   https://whatsapp-api-backend.onrender.com
   ```
   (Your actual URL will be different)

3. **COPY THIS URL!** You'll need it for the frontend.

---

### PART 5: TEST BACKEND

#### Step 5.1: Test Health Endpoint

1. Open a new browser tab
2. Go to:
   ```
   https://YOUR-BACKEND-URL.onrender.com/api/v1/health
   ```
   (Replace with your actual URL)

3. You should see:
   ```json
   {"status":"ok","timestamp":"2025-10-01T..."}
   ```

**If you see this, backend is working!** ✅

#### Step 5.2: Test API Documentation

1. Go to:
   ```
   https://YOUR-BACKEND-URL.onrender.com/api/v1/docs
   ```

2. You should see Swagger API documentation

**If you see this, backend is fully working!** ✅

---

## ✅ VERIFICATION CHECKLIST

After completing all steps:

- [ ] Service created with **Node runtime** (not Docker)
- [ ] Root directory set to `server`
- [ ] All environment variables added (50+ variables)
- [ ] Deployment status is "**Live**"
- [ ] Logs show "Server is running on port 10000"
- [ ] Health endpoint responds with `{"status":"ok"}`
- [ ] API docs accessible
- [ ] No Dockerfile errors in logs
- [ ] No "vite: not found" errors

---

## 🆘 TROUBLESHOOTING

### Issue: Still seeing Dockerfile errors

**Cause**: You selected "Docker" runtime instead of "Node"

**Fix**: 
1. Delete service again
2. Recreate
3. **Make sure to select "Node" in the Environment dropdown!**

### Issue: "Cannot find module"

**Cause**: Root directory not set to `server`

**Fix**:
1. Go to Settings
2. Set Root Directory to `server`
3. Manual Deploy → Clear build cache & deploy

### Issue: "Port already in use"

**Cause**: PORT environment variable not set

**Fix**:
1. Go to Environment tab
2. Add: `PORT=10000`
3. Save changes

### Issue: Deployment takes too long

**Cause**: Normal for first deployment

**Fix**: Wait 15-20 minutes. Render free tier can be slow.

---

## 📊 WHAT YOU SHOULD SEE

### ✅ CORRECT Logs:

```
==> Entering directory: server
==> Running 'npm install'
==> Running 'npm start'
✅ Server is running on port 10000
```

### ❌ WRONG Logs:

```
==> Building Dockerfile
sh: vite: not found
error: exit status 1
```

---

## 🎯 NEXT STEPS

After backend is deployed successfully:

1. **Copy backend URL**
2. **Update Vercel environment variables**:
   - `VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api/v1`
   - `VITE_WS_URL=wss://YOUR-BACKEND-URL.onrender.com`
3. **Redeploy frontend** on Vercel
4. **Test registration**

See: `FIX_FRONTEND_LOCALHOST_ISSUE.md`

---

## ⏱️ TOTAL TIME

- Delete service: 1 min
- Create service: 2 min
- Add env vars: 5 min
- Deployment: 10-15 min
- **TOTAL: ~20 min**

---

**🚀 START NOW: DELETE SERVICE AND RECREATE WITH NODE RUNTIME!**
