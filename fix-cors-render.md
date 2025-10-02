# 🚨 URGENT: Fix CORS Configuration in Render

## Problem Identified
Your frontend URL is: `https://dist-eta-sooty.vercel.app`
But the backend CORS is configured for: `https://dist-eta-sootyvercel.app` (missing dot)

## Quick Fix Steps

### Step 1: Update Render Environment Variable
1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your service**: `whatsapp-flow-i0e2`
3. **Click on the service name**
4. **Go to "Environment" tab**
5. **Find the `CORS_ORIGIN` variable**
6. **Update it to**: `https://dist-eta-sooty.vercel.app`
7. **Click "Save Changes"**

### Step 2: Redeploy Backend
1. **In the same Render dashboard**
2. **Go to "Manual Deploy" section**
3. **Click "Deploy Latest Commit"**
4. **Wait 2-3 minutes for deployment**

### Step 3: Test the Fix
1. **Wait for deployment to complete**
2. **Go to your frontend**: https://dist-eta-sooty.vercel.app
3. **Try to create a session**
4. **CORS error should be gone!**

## Alternative: Remove CORS_ORIGIN Entirely
If the above doesn't work, you can:
1. **Delete the `CORS_ORIGIN` environment variable** in Render
2. **Redeploy**
3. **The backend will use the default fallback** which includes your URL

## Expected Result
✅ No more CORS errors
✅ Sessions page loads properly
✅ You can create WhatsApp sessions
✅ QR codes will display correctly

## If Still Not Working
The backend code has a fallback that includes your URL:
```javascript
origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'https://dist-eta-sooty.vercel.app']
```

So removing the CORS_ORIGIN environment variable entirely should work as a backup solution.
