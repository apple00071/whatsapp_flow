# 🚀 Quick Start - WhatsApp API Platform

## ⚠️ Current Issue

The server needs **Redis** to run. You have 3 options:

---

## Option 1: Use Docker (RECOMMENDED - Easiest)

This will start everything (Backend, Frontend, Redis) with one command:

```powershell
# Make sure Docker Desktop is installed and running
docker-compose up -d

# Wait for services to start (30 seconds)
# Then access:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - API Docs: http://localhost:3000/api/docs
```

**Before running Docker:**
1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop
3. Update `server/.env` with your Supabase credentials (see below)

---

## Option 2: Install Redis Locally (Windows)

### Install Memurai (Redis for Windows)

1. Download Memurai from: https://www.memurai.com/get-memurai
2. Install and start the service
3. Redis will run on port 6379

### Then start the servers:

```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

---

## Option 3: Use Redis Cloud (Free)

1. Go to https://redis.com/try-free/
2. Create a free account
3. Create a new database
4. Get your connection URL
5. Update `server/.env`:
   ```
   REDIS_URL=redis://default:password@your-redis-host:port
   ```

---

## 🔧 Required Setup: Supabase Database

**You MUST set up Supabase before the platform will work:**

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create a new project
4. Wait 2-3 minutes for provisioning

### Step 2: Get Your Credentials

1. Go to **Project Settings** → **Database**
2. Copy the **Connection String** (URI format)
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** and **API Keys**

### Step 3: Update server/.env

Open `server/.env` and update these values:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection (from Supabase)
DATABASE_URL=postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-db-password
```

**See `SUPABASE_SETUP_GUIDE.md` for detailed instructions**

---

## 📋 Complete Setup Checklist

### Before Starting:

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] `server/.env` updated with Supabase credentials
- [ ] Redis installed OR Docker Desktop installed

### Using Docker:

```powershell
# 1. Make sure Docker Desktop is running
# 2. Update server/.env with Supabase credentials
# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec server npm run db:migrate
docker-compose exec server npm run db:seed

# 5. View logs
docker-compose logs -f

# 6. Access the platform
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

### Using Local Installation:

```powershell
# 1. Install Redis (Memurai for Windows)
# 2. Update server/.env with Supabase credentials

# 3. Terminal 1 - Backend
cd server
npm install
npm run db:migrate
npm run db:seed
npm run dev

# 4. Terminal 2 - Frontend
cd client
npm install
npm run dev

# 5. Access the platform
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## 🎯 What to Do Now

### Immediate Action Required:

1. **Set up Supabase** (5 minutes)
   - Follow `SUPABASE_SETUP_GUIDE.md`
   - Update `server/.env` with your credentials

2. **Choose your Redis option:**
   - **Option A**: Install Docker Desktop (recommended)
   - **Option B**: Install Memurai (Redis for Windows)
   - **Option C**: Use Redis Cloud (free tier)

3. **Start the platform:**
   - With Docker: `docker-compose up -d`
   - Without Docker: Start Redis, then `npm run dev` in server and client

---

## 🆘 Troubleshooting

### Error: "Redis connection refused"
- **Solution**: Install Redis/Memurai or use Docker
- Redis must be running on port 6379

### Error: "Database connection failed"
- **Solution**: Update `server/.env` with correct Supabase credentials
- Make sure your Supabase project is active

### Error: "Port 3000 already in use"
- **Solution**: Kill the process using port 3000
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Docker not starting
- **Solution**: Make sure Docker Desktop is installed and running
- Check if virtualization is enabled in BIOS

---

## 📚 Documentation

- **SUPABASE_SETUP_GUIDE.md** - Complete Supabase setup
- **QUICK_START.md** - 5-minute quick start
- **LOCAL_SETUP_GUIDE.md** - Detailed local setup
- **API_TESTING_GUIDE.md** - Test the API
- **100_PERCENT_COMPLETION_GUIDE.md** - Full feature list

---

## 🎉 Once Running

After setup, you can:

1. **Register** a new account at http://localhost:5173/register
2. **Create** a WhatsApp session
3. **Scan** the QR code with WhatsApp
4. **Send** your first message!

---

## 💡 Recommended: Use Docker

Docker is the easiest way to get started:

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Update `server/.env` with Supabase credentials
3. Run: `docker-compose up -d`
4. Done! Everything runs automatically

---

**Need Help?**
- Check the documentation files
- Review the error messages
- Make sure Supabase is set up correctly
- Ensure Redis is running

**Repository**: https://github.com/apple00071/whatsapp_flow
**Status**: Production-Ready (needs Supabase + Redis setup)

