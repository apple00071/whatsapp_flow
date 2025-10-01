# ============================================================
# RENDER DEPLOYMENT SCRIPT
# ============================================================
# This script deploys your WhatsApp API Platform to Render
# and monitors the deployment in real-time
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 RENDER DEPLOYMENT - WHATSAPP API PLATFORM" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# STEP 1: Check prerequisites
# ============================================================
Write-Host "📦 STEP 1: Checking prerequisites..." -ForegroundColor Green
Write-Host ""

# Check if RENDER_API_KEY is set
if ([string]::IsNullOrWhiteSpace($env:RENDER_API_KEY)) {
    Write-Host "❌ RENDER_API_KEY not found" -ForegroundColor Red
    Write-Host "   Please run: .\render-cli-setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ RENDER_API_KEY found" -ForegroundColor Green

# Check if service name file exists
if (-not (Test-Path ".render-service-name")) {
    Write-Host "❌ Service name file not found" -ForegroundColor Red
    Write-Host "   Please run: .\render-cli-setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

$serviceName = Get-Content ".render-service-name" -Raw
$serviceName = $serviceName.Trim()
Write-Host "✅ Service name: $serviceName" -ForegroundColor Green

# Check if git repo
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git repository found" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 2: Check current git status
# ============================================================
Write-Host "📦 STEP 2: Checking git status..." -ForegroundColor Green
Write-Host ""

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host ""
    git status --short
    Write-Host ""
    
    $commit = Read-Host "Commit changes before deploying? (y/n)"
    if ($commit -eq 'y') {
        $commitMessage = Read-Host "Enter commit message"
        git add .
        git commit -m "$commitMessage"
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
}

# Get current commit
$currentCommit = git rev-parse --short HEAD
$currentBranch = git branch --show-current

Write-Host "✅ Current branch: $currentBranch" -ForegroundColor Green
Write-Host "✅ Current commit: $currentCommit" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 3: Push to GitHub
# ============================================================
Write-Host "📦 STEP 3: Pushing to GitHub..." -ForegroundColor Green
Write-Host ""

Write-Host "Pushing to origin/$currentBranch..." -ForegroundColor Cyan
try {
    git push origin $currentBranch
    Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to push to GitHub" -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 4: Trigger Render deployment
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 STEP 4: TRIGGERING RENDER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Render will automatically deploy when it detects the GitHub push" -ForegroundColor Yellow
Write-Host "This usually takes 1-2 minutes to start" -ForegroundColor Yellow
Write-Host ""

Write-Host "Waiting for deployment to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""

# ============================================================
# STEP 5: Monitor deployment logs
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📊 STEP 5: MONITORING DEPLOYMENT LOGS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening deployment logs..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

# Use Render CLI to tail logs
try {
    Write-Host "============================================================" -ForegroundColor Gray
    Write-Host "DEPLOYMENT LOGS (Real-time)" -ForegroundColor Gray
    Write-Host "============================================================" -ForegroundColor Gray
    Write-Host ""
    
    # Tail logs using Render CLI
    render services logs $serviceName --tail
    
} catch {
    Write-Host ""
    Write-Host "⚠️  Failed to tail logs automatically" -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual log viewing:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Gray
    Write-Host "2. Select your service: $serviceName" -ForegroundColor Gray
    Write-Host "3. Click: Logs tab" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 DEPLOYMENT CHECKLIST" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Watch for these log messages:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Build successful 🎉" -ForegroundColor Gray
Write-Host "✓ IPv4 connection enforced at socket level" -ForegroundColor Gray
Write-Host "✓ All modules loaded successfully!" -ForegroundColor Gray
Write-Host "✓ Forcing IPv4 connection for database" -ForegroundColor Gray
Write-Host "✓ Database connection successful" -ForegroundColor Gray
Write-Host "✓ Database synchronized" -ForegroundColor Gray
Write-Host "✓ Redis connection successful" -ForegroundColor Gray
Write-Host "✓ Rate limit Redis client initialized" -ForegroundColor Gray
Write-Host "✓ WhatsApp manager initialized" -ForegroundColor Gray
Write-Host "✓ SERVER IS RUNNING!" -ForegroundColor Gray
Write-Host "✓ Port: 10000" -ForegroundColor Gray
Write-Host ""

Write-Host "If you see ENETUNREACH error:" -ForegroundColor Yellow
Write-Host "1. Run: .\render-troubleshoot.ps1" -ForegroundColor Cyan
Write-Host "2. Try alternative DATABASE_URL (connection pooler)" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

