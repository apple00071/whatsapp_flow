# Test script to verify WhatsApp connection fixes
Write-Host "🔧 Testing WhatsApp Connection Fixes..." -ForegroundColor Cyan

# Test 1: Backend Health Check
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://whatsapp-flow-i0e2.onrender.com/api/v1/health" -Method GET -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "   Uptime: $($healthData.uptime)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: CORS Configuration
Write-Host "`n2. Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $corsHeaders = @{
        'Origin' = 'https://dist-eta-sooty.vercel.app'
        'Access-Control-Request-Method' = 'POST'
        'Access-Control-Request-Headers' = 'Content-Type,Authorization'
    }
    
    $corsResponse = Invoke-WebRequest -Uri "https://whatsapp-flow-i0e2.onrender.com/api/v1/health" -Method OPTIONS -Headers $corsHeaders -UseBasicParsing
    
    if ($corsResponse.Headers.'Access-Control-Allow-Origin') {
        Write-Host "✅ CORS is properly configured" -ForegroundColor Green
        Write-Host "   Allowed Origin: $($corsResponse.Headers.'Access-Control-Allow-Origin')" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  CORS headers not found in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: WebSocket Connection Test
Write-Host "`n3. Testing WebSocket Endpoint..." -ForegroundColor Yellow
try {
    $wsTestResponse = Invoke-WebRequest -Uri "https://whatsapp-flow-i0e2.onrender.com/socket.io/" -Method GET -UseBasicParsing
    if ($wsTestResponse.StatusCode -eq 200) {
        Write-Host "✅ WebSocket endpoint is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ WebSocket endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Frontend Accessibility
Write-Host "`n4. Testing Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://dist-eta-sooty.vercel.app" -Method GET -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend accessibility test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "   - Backend Health: Check above results" -ForegroundColor Gray
Write-Host "   - CORS Config: Check above results" -ForegroundColor Gray
Write-Host "   - WebSocket: Check above results" -ForegroundColor Gray
Write-Host "   - Frontend: Check above results" -ForegroundColor Gray

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Update CORS_ORIGIN in Render dashboard if needed" -ForegroundColor Gray
Write-Host "   2. Redeploy backend after CORS fix" -ForegroundColor Gray
Write-Host "   3. Test QR code scanning with real WhatsApp" -ForegroundColor Gray
Write-Host "   4. Verify session status updates in real-time" -ForegroundColor Gray

Write-Host "`n✨ Expected Results After Fixes:" -ForegroundColor Green
Write-Host "   ✅ QR code displays without 'Data too long' error" -ForegroundColor Gray
Write-Host "   ✅ After scanning QR, status changes to 'authenticating'" -ForegroundColor Gray
Write-Host "   ✅ Session automatically becomes 'connected'" -ForegroundColor Gray
Write-Host "   ✅ QR dialog closes automatically when connected" -ForegroundColor Gray
Write-Host "   ✅ Real-time status updates via WebSocket" -ForegroundColor Gray
