#!/bin/bash

echo "🔍 Quick Backend Status Check"
echo "============================="

# Check if PM2 is running
echo "1. PM2 Status:"
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "   ❌ PM2 not installed"
fi

echo ""

# Check if port 3001 is in use
echo "2. Port 3001 Status:"
if netstat -tlnp 2>/dev/null | grep :3001 > /dev/null; then
    echo "   ✅ Port 3001 is in use"
    netstat -tlnp | grep :3001
else
    echo "   ❌ Port 3001 is not in use"
fi

echo ""

# Check if server.js exists
echo "3. Server Files:"
if [ -f "server.js" ]; then
    echo "   ✅ server.js exists"
else
    echo "   ❌ server.js missing"
fi

if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
else
    echo "   ❌ package.json missing"
fi

echo ""

# Check environment
echo "4. Environment:"
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    echo "   📄 Environment variables:"
    grep -v '^#' .env | grep -v '^$' | while read line; do
        echo "     $line"
    done
else
    echo "   ❌ .env file missing"
fi

echo ""

# Test API endpoint
echo "5. API Test:"
if curl -s http://localhost:3001/api/whatsapp/status > /dev/null 2>&1; then
    echo "   ✅ API is responding"
    echo "   📄 Response:"
    curl -s http://localhost:3001/api/whatsapp/status | jq . 2>/dev/null || curl -s http://localhost:3001/api/whatsapp/status
else
    echo "   ❌ API is not responding"
fi

echo ""

# Check logs
echo "6. Recent Logs:"
if command -v pm2 &> /dev/null; then
    echo "   📝 Last 5 lines from PM2 logs:"
    pm2 logs whatsapp-flow --lines 5 --nostream 2>/dev/null || echo "   No logs available"
else
    echo "   PM2 not available for log checking"
fi

echo ""

# Quick fixes
echo "🚀 Quick Fix Commands:"
echo "   To restart: pm2 restart whatsapp-flow"
echo "   To start fresh: pm2 delete all && ./start-backend.sh"
echo "   To check logs: pm2 logs whatsapp-flow"
echo "   To test API: curl http://localhost:3001/api/whatsapp/status" 