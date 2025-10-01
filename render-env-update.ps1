# ============================================================
# RENDER ENVIRONMENT VARIABLES UPDATE SCRIPT
# ============================================================
# This script updates environment variables on Render
# using the values from RENDER_ENV_VARS_COPY_PASTE.txt
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔧 RENDER ENVIRONMENT VARIABLES UPDATE" -ForegroundColor Cyan
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

# Check if env vars file exists
if (-not (Test-Path "RENDER_ENV_VARS_COPY_PASTE.txt")) {
    Write-Host "❌ RENDER_ENV_VARS_COPY_PASTE.txt not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables file found" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 2: Parse environment variables
# ============================================================
Write-Host "📦 STEP 2: Parsing environment variables..." -ForegroundColor Green
Write-Host ""

$envVars = @{}
$lineNumber = 0

Get-Content "RENDER_ENV_VARS_COPY_PASTE.txt" | ForEach-Object {
    $lineNumber++
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }
    
    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        $envVars[$key] = $value
        Write-Host "  ✓ $key" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Skipping invalid line $lineNumber`: $line" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Parsed $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# ============================================================
# STEP 3: Display critical variables
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔍 CRITICAL VARIABLES CHECK" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check DATABASE_URL
if ($envVars.ContainsKey("DATABASE_URL")) {
    $dbUrl = $envVars["DATABASE_URL"]
    if ($dbUrl -match '%24' -and $dbUrl -match '%2A') {
        Write-Host "✅ DATABASE_URL: URL-encoded (correct)" -ForegroundColor Green
        Write-Host "   Password contains: %24 (for `$) and %2A (for *)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  DATABASE_URL: May not be URL-encoded" -ForegroundColor Yellow
        Write-Host "   Current value: $dbUrl" -ForegroundColor Gray
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            Write-Host "Aborted" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "⚠️  DATABASE_URL not found in env vars" -ForegroundColor Yellow
}

Write-Host ""

# Check REDIS_URL
if ($envVars.ContainsKey("REDIS_URL")) {
    Write-Host "✅ REDIS_URL: Found" -ForegroundColor Green
} else {
    Write-Host "⚠️  REDIS_URL not found in env vars" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================
# STEP 4: Confirm update
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "⚠️  CONFIRMATION REQUIRED" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will update $($envVars.Count) environment variables on:" -ForegroundColor Yellow
Write-Host "Service: $serviceName" -ForegroundColor Cyan
Write-Host ""
Write-Host "This action will:" -ForegroundColor Yellow
Write-Host "- Update all environment variables" -ForegroundColor Gray
Write-Host "- Trigger a new deployment" -ForegroundColor Gray
Write-Host "- May cause brief downtime" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "Aborted" -ForegroundColor Red
    exit 0
}

Write-Host ""

# ============================================================
# STEP 5: Update environment variables using Render API
# ============================================================
Write-Host "📦 STEP 5: Updating environment variables..." -ForegroundColor Green
Write-Host ""

Write-Host "Note: Render CLI doesn't support bulk env var updates" -ForegroundColor Yellow
Write-Host "We'll use the Render API directly" -ForegroundColor Yellow
Write-Host ""

# Create JSON payload
$envVarArray = @()
foreach ($key in $envVars.Keys) {
    $envVarArray += @{
        key = $key
        value = $envVars[$key]
    }
}

$payload = @{
    envVars = $envVarArray
} | ConvertTo-Json -Depth 10

# Save payload to temp file
$payload | Out-File -FilePath "temp-env-vars.json" -Encoding UTF8

Write-Host "Environment variables prepared" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# STEP 6: Manual update instructions
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 MANUAL UPDATE REQUIRED" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Unfortunately, Render CLI doesn't support bulk env var updates yet." -ForegroundColor Yellow
Write-Host "You have two options:" -ForegroundColor Yellow
Write-Host ""

Write-Host "OPTION 1: Use Render Dashboard (Recommended)" -ForegroundColor Cyan
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Gray
Write-Host "2. Select your service: $serviceName" -ForegroundColor Gray
Write-Host "3. Go to: Environment tab" -ForegroundColor Gray
Write-Host "4. Update these critical variables:" -ForegroundColor Gray
Write-Host ""
Write-Host "   DATABASE_URL=$($envVars['DATABASE_URL'])" -ForegroundColor White
Write-Host ""
Write-Host "5. Click 'Save Changes'" -ForegroundColor Gray
Write-Host ""

Write-Host "OPTION 2: Use Render API with curl" -ForegroundColor Cyan
Write-Host "Run this command in PowerShell:" -ForegroundColor Gray
Write-Host ""
Write-Host "curl -X PATCH ``" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer $env:RENDER_API_KEY' ``" -ForegroundColor White
Write-Host "  -H 'Content-Type: application/json' ``" -ForegroundColor White
Write-Host "  -d '@temp-env-vars.json' ``" -ForegroundColor White
Write-Host "  https://api.render.com/v1/services/$serviceName/env-vars" -ForegroundColor White
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ ENVIRONMENT VARIABLES READY" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Critical variables to update:" -ForegroundColor Yellow
Write-Host ""
Write-Host "DATABASE_URL (URL-encoded):" -ForegroundColor Cyan
Write-Host "$($envVars['DATABASE_URL'])" -ForegroundColor White
Write-Host ""

Write-Host "After updating, run: .\render-deploy.ps1" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

