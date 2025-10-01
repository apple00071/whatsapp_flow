# ============================================================
# RENDER CLI SETUP SCRIPT FOR WINDOWS POWERSHELL
# ============================================================
# This script installs and configures the Render CLI
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 RENDER CLI SETUP FOR WHATSAPP API PLATFORM" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some installations may require admin privileges" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================
# STEP 1: Check if Node.js is installed
# ============================================================
Write-Host "📦 STEP 1: Checking Node.js installation..." -ForegroundColor Green
Write-Host ""

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   Then run this script again" -ForegroundColor Yellow
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is NOT installed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================
# STEP 2: Install Render CLI
# ============================================================
Write-Host "📦 STEP 2: Installing Render CLI..." -ForegroundColor Green
Write-Host ""

Write-Host "Installing @render/cli globally..." -ForegroundColor Cyan
try {
    npm install -g @render/cli
    Write-Host "✅ Render CLI installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Render CLI" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================
# STEP 3: Verify Render CLI installation
# ============================================================
Write-Host "📦 STEP 3: Verifying Render CLI installation..." -ForegroundColor Green
Write-Host ""

try {
    $renderVersion = render --version
    Write-Host "✅ Render CLI version: $renderVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Render CLI verification failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================
# STEP 4: Authenticate with Render
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔐 STEP 4: AUTHENTICATE WITH RENDER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You need to authenticate with Render using an API key." -ForegroundColor Yellow
Write-Host ""
Write-Host "To get your API key:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com/account/api-keys" -ForegroundColor Cyan
Write-Host "2. Click 'Create API Key'" -ForegroundColor Cyan
Write-Host "3. Give it a name (e.g., 'CLI Access')" -ForegroundColor Cyan
Write-Host "4. Copy the API key" -ForegroundColor Cyan
Write-Host ""

$apiKey = Read-Host "Enter your Render API key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ No API key provided" -ForegroundColor Red
    exit 1
}

# Set the API key as environment variable
$env:RENDER_API_KEY = $apiKey

# Also save to user profile for persistence
[System.Environment]::SetEnvironmentVariable('RENDER_API_KEY', $apiKey, [System.EnvironmentVariableTarget]::User)

Write-Host ""
Write-Host "✅ API key saved to environment variable" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 5: Test authentication
# ============================================================
Write-Host "📦 STEP 5: Testing authentication..." -ForegroundColor Green
Write-Host ""

try {
    Write-Host "Fetching your Render services..." -ForegroundColor Cyan
    render services list
    Write-Host ""
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    Write-Host "   Please check your API key and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================================
# STEP 6: Find your service
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔍 STEP 6: FIND YOUR SERVICE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Please enter your Render service name or ID:" -ForegroundColor Yellow
Write-Host "(You can find this in the Render dashboard)" -ForegroundColor Yellow
Write-Host ""

$serviceName = Read-Host "Service name or ID"

if ([string]::IsNullOrWhiteSpace($serviceName)) {
    Write-Host "❌ No service name provided" -ForegroundColor Red
    exit 1
}

# Save service name to a file for later use
$serviceName | Out-File -FilePath ".render-service-name" -Encoding UTF8

Write-Host ""
Write-Host "✅ Service name saved: $serviceName" -ForegroundColor Green
Write-Host ""

# ============================================================
# COMPLETION
# ============================================================
Write-Host "============================================================" -ForegroundColor Green
Write-Host "✅ RENDER CLI SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: .\render-deploy.ps1" -ForegroundColor Yellow
Write-Host "   This will deploy your backend to Render" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run: .\render-logs.ps1" -ForegroundColor Yellow
Write-Host "   This will show real-time deployment logs" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run: .\render-env-update.ps1" -ForegroundColor Yellow
Write-Host "   This will update environment variables" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📚 SAVED FILES:" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "- .render-service-name: Your service name" -ForegroundColor Gray
Write-Host "- RENDER_API_KEY: Saved to user environment variables" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

