# ============================================================
# RENDER TROUBLESHOOTING SCRIPT
# ============================================================
# This script helps troubleshoot deployment issues
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔧 RENDER TROUBLESHOOTING - DATABASE CONNECTION" -ForegroundColor Cyan
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

# ============================================================
# DATABASE_URL Options
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 DATABASE_URL TROUBLESHOOTING OPTIONS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If you're seeing ENETUNREACH errors, try these alternatives:" -ForegroundColor Yellow
Write-Host ""

# Option 1: Current (Direct connection)
Write-Host "OPTION 1: Direct Connection (Current)" -ForegroundColor Cyan
Write-Host "Port: 5432" -ForegroundColor Gray
Write-Host "URL:" -ForegroundColor Gray
Write-Host "postgresql://postgres:hC6gdcJ%24fr%2A%24PUv@db.frifbegpqtxllisfmfmw.supabase.co:5432/postgres" -ForegroundColor White
Write-Host ""

# Option 2: Connection Pooler
Write-Host "OPTION 2: Connection Pooler (Recommended for IPv6 issues)" -ForegroundColor Cyan
Write-Host "Port: 6543 (PgBouncer)" -ForegroundColor Gray
Write-Host "URL:" -ForegroundColor Gray
Write-Host "postgresql://postgres:hC6gdcJ%24fr%2A%24PUv@db.frifbegpqtxllisfmfmw.supabase.co:6543/postgres?pgbouncer=true" -ForegroundColor White
Write-Host ""

# Option 3: IPv4 Address
Write-Host "OPTION 3: Direct IPv4 Address" -ForegroundColor Cyan
Write-Host "First, find the IPv4 address:" -ForegroundColor Gray
Write-Host "nslookup db.frifbegpqtxllisfmfmw.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "Then use:" -ForegroundColor Gray
Write-Host "postgresql://postgres:hC6gdcJ%24fr%2A%24PUv@[IPv4_ADDRESS]:5432/postgres" -ForegroundColor White
Write-Host ""

# ============================================================
# Interactive selection
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔧 SELECT OPTION TO TRY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Which option would you like to try?" -ForegroundColor Yellow
Write-Host "1. Keep current (Direct connection - port 5432)" -ForegroundColor Gray
Write-Host "2. Try connection pooler (port 6543)" -ForegroundColor Gray
Write-Host "3. Find IPv4 address and use it" -ForegroundColor Gray
Write-Host "4. Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "✅ Keeping current DATABASE_URL" -ForegroundColor Green
        Write-Host "   Make sure it's URL-encoded in Render dashboard" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Go to: https://dashboard.render.com" -ForegroundColor Cyan
        Write-Host "Service: $serviceName" -ForegroundColor Cyan
        Write-Host "Environment tab → DATABASE_URL" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Value should be:" -ForegroundColor Yellow
        Write-Host "postgresql://postgres:hC6gdcJ%24fr%2A%24PUv@db.frifbegpqtxllisfmfmw.supabase.co:5432/postgres" -ForegroundColor White
    }
    
    "2" {
        Write-Host ""
        Write-Host "✅ Using connection pooler (port 6543)" -ForegroundColor Green
        Write-Host ""
        $newDbUrl = "postgresql://postgres:hC6gdcJ%24fr%2A%24PUv@db.frifbegpqtxllisfmfmw.supabase.co:6543/postgres?pgbouncer=true"
        
        Write-Host "New DATABASE_URL:" -ForegroundColor Yellow
        Write-Host $newDbUrl -ForegroundColor White
        Write-Host ""
        
        Write-Host "To update:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Gray
        Write-Host "2. Service: $serviceName" -ForegroundColor Gray
        Write-Host "3. Environment tab" -ForegroundColor Gray
        Write-Host "4. Update DATABASE_URL to the value above" -ForegroundColor Gray
        Write-Host "5. Click 'Save Changes'" -ForegroundColor Gray
        Write-Host ""
        
        # Copy to clipboard if possible
        try {
            $newDbUrl | Set-Clipboard
            Write-Host "✅ Copied to clipboard!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not copy to clipboard" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔍 Finding IPv4 address..." -ForegroundColor Cyan
        Write-Host ""
        
        try {
            $nslookup = nslookup db.frifbegpqtxllisfmfmw.supabase.co
            Write-Host $nslookup -ForegroundColor Gray
            Write-Host ""
            
            Write-Host "Look for 'Address:' lines that are IPv4 (e.g., 192.168.x.x)" -ForegroundColor Yellow
            Write-Host ""
            
            $ipv4 = Read-Host "Enter the IPv4 address you found"
            
            if (-not [string]::IsNullOrWhiteSpace($ipv4)) {
                $newDbUrl = "postgresql://postgres:hC6gdcJ%24fr%2A%24PUv@$ipv4:5432/postgres"
                
                Write-Host ""
                Write-Host "New DATABASE_URL:" -ForegroundColor Yellow
                Write-Host $newDbUrl -ForegroundColor White
                Write-Host ""
                
                Write-Host "⚠️  WARNING: Using IP address directly may break if Supabase changes IPs" -ForegroundColor Yellow
                Write-Host ""
                
                Write-Host "To update:" -ForegroundColor Cyan
                Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Gray
                Write-Host "2. Service: $serviceName" -ForegroundColor Gray
                Write-Host "3. Environment tab" -ForegroundColor Gray
                Write-Host "4. Update DATABASE_URL to the value above" -ForegroundColor Gray
                Write-Host "5. Click 'Save Changes'" -ForegroundColor Gray
                Write-Host ""
                
                # Copy to clipboard if possible
                try {
                    $newDbUrl | Set-Clipboard
                    Write-Host "✅ Copied to clipboard!" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️  Could not copy to clipboard" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Failed to run nslookup" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host "Exiting..." -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 NEXT STEPS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Update DATABASE_URL in Render dashboard" -ForegroundColor Yellow
Write-Host "2. Wait for automatic redeploy (or trigger manually)" -ForegroundColor Yellow
Write-Host "3. Run: .\render-logs.ps1" -ForegroundColor Yellow
Write-Host "4. Watch for 'Database connection successful'" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

