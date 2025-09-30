# Local Setup Guide - WhatsApp API Platform

## Current Status

✅ Node.js v22.13.0 installed
✅ Server dependencies installed (956 packages)
❌ Docker not available
❌ PostgreSQL not installed
❌ Redis not installed

## Quick Setup Options

### Option 1: Install Required Services (Recommended for Full Features)

#### Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. PostgreSQL will run on port 5432

#### Install Redis
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Or use Memurai (Redis alternative for Windows): https://www.memurai.com/
3. Install and start the service
4. Redis will run on port 6379

#### Start the Platform
```powershell
# Terminal 1 - Backend
cd server
npm run db:setup  # Creates database and seeds data
npm run dev       # Starts on port 3000

# Terminal 2 - Frontend
cd client
npm install
npm run dev       # Starts on port 5173
```

### Option 2: Use Docker (Easiest - All Services Included)

#### Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Start Docker Desktop

#### Start Everything with One Command
```powershell
docker-compose up -d
```

This starts:
- Backend API (port 3000)
- Frontend (port 5173)
- PostgreSQL (port 5432)
- Redis (port 6379)
- pgAdmin (port 5050)

### Option 3: Use SQLite for Quick Testing (Limited Features)

**Note**: This option has limitations:
- No Redis caching (slower performance)
- No Bull queue for webhooks (webhooks won't work)
- No real-time WebSocket features
- Good for API testing only

I can modify the code to use SQLite if you want to test quickly without installing PostgreSQL/Redis.

## Recommended Approach

**For the best experience, I recommend Option 1 or Option 2.**

### Why Option 1 (Install Services)?
- ✅ Full features working
- ✅ Better for development
- ✅ Services run in background
- ✅ Can use pgAdmin for database management

### Why Option 2 (Docker)?
- ✅ Easiest setup
- ✅ Everything included
- ✅ One command to start/stop
- ✅ Isolated environment
- ✅ Production-like setup

## What Would You Like to Do?

1. **Install PostgreSQL & Redis** (15 minutes) - Full features
2. **Install Docker** (10 minutes) - Easiest option
3. **Use SQLite** (5 minutes) - Quick test, limited features

Let me know which option you prefer, and I'll guide you through the setup!

## Current Files Ready

✅ server/.env - Environment configuration
✅ client/.env - Frontend configuration
✅ server/node_modules - Dependencies installed
✅ All backend code (45+ files)
✅ All frontend code (25+ files)
✅ SDKs (Node.js & Python)
✅ Documentation (10+ guides)

## Next Steps After Setup

Once services are running:

1. **Access API Documentation**
   - http://localhost:3000/api/docs

2. **Test with Default Credentials**
   - Email: test@example.com
   - Password: Test@123

3. **Create WhatsApp Session**
   - Use the frontend or API
   - Scan QR code with WhatsApp
   - Start sending messages!

4. **Test with SDKs**
   ```javascript
   // Node.js
   const WhatsAppAPI = require('@whatsapp-platform/sdk');
   const client = new WhatsAppAPI({ apiKey: 'your-key' });
   ```

   ```python
   # Python
   from whatsapp_api import WhatsAppAPI
   client = WhatsAppAPI(api_key='your-key')
   ```

## Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Database Connection Error
- Make sure PostgreSQL is running
- Check credentials in server/.env
- Verify DATABASE_URL is correct

### Redis Connection Error
- Make sure Redis/Memurai is running
- Check REDIS_URL in server/.env

## Quick Test (Without Full Setup)

If you just want to see the code structure:

```powershell
# View API documentation
cd server
npm run dev

# Then open: http://localhost:3000/api/docs
```

This will show Swagger UI even without database (some endpoints won't work).

