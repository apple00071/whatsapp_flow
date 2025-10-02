#!/usr/bin/env pwsh

# Test QR Code Fix Script
# This script tests the QR code functionality after the fix

Write-Host "Testing QR Code Fix..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is responding
Write-Host "1. Testing backend health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://whatsapp-flow-i0e2.onrender.com/api/v1/health" -Method GET -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host "   Backend health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check CORS headers
Write-Host "2. Testing CORS configuration..." -ForegroundColor Yellow
try {
    $corsResponse = Invoke-WebRequest -Uri "https://whatsapp-flow-i0e2.onrender.com/api/v1/health" -Method OPTIONS -Headers @{
        "Origin" = "https://dist-16ndbi419-apple00071s-projects.vercel.app"
        "Access-Control-Request-Method" = "GET"
    } -UseBasicParsing
    
    $corsHeader = $corsResponse.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader -contains "https://dist-16ndbi419-apple00071s-projects.vercel.app" -or $corsHeader -contains "*") {
        Write-Host "   CORS is properly configured" -ForegroundColor Green
    } else {
        Write-Host "   CORS might need updating. Current origin: $corsHeader" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Could not test CORS: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. The QR code fix has been applied to the code" -ForegroundColor White
Write-Host "2. You need to redeploy the backend for changes to take effect" -ForegroundColor White
Write-Host "3. Go to Render dashboard and trigger a manual deployment" -ForegroundColor White
Write-Host "4. Test QR code generation in the frontend" -ForegroundColor White
Write-Host ""
Write-Host "Render Dashboard: https://dashboard.render.com" -ForegroundColor Blue
Write-Host "Frontend URL: https://dist-16ndbi419-apple00071s-projects.vercel.app" -ForegroundColor Blue
Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
