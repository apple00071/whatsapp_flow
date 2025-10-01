# ============================================================
# RENDER LOGS MONITORING SCRIPT
# ============================================================
# This script shows real-time logs from your Render service
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📊 RENDER LOGS - REAL-TIME MONITORING" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# Check prerequisites
# ============================================================
if ([string]::IsNullOrWhiteSpace($env:RENDER_API_KEY)) {
    Write-Host "❌ RENDER_API_KEY not found" -ForegroundColor Red
    Write-Host "   Please run: .\render-cli-setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".render-service-name")) {
    Write-Host "❌ Service name file not found" -ForegroundColor Red
    Write-Host "   Please run: .\render-cli-setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

$serviceName = Get-Content ".render-service-name" -Raw
$serviceName = $serviceName.Trim()

Write-Host "Service: $serviceName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "LOGS (Real-time)" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Gray
Write-Host ""

# Tail logs
try {
    render services logs $serviceName --tail
} catch {
    Write-Host ""
    Write-Host "❌ Failed to fetch logs" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: View logs in dashboard" -ForegroundColor Yellow
    Write-Host "https://dashboard.render.com" -ForegroundColor Cyan
    exit 1
}

