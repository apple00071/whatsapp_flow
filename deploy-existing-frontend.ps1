# Deploy Existing Frontend to Vercel
Write-Host "Deploying existing WhatsApp Flow Frontend to Vercel..."

# Change to frontend directory
Set-Location -Path ".\frontend-deploy"

# Ensure dependencies are installed
Write-Host "Installing dependencies..."
npm install

# Update tsconfig to exclude server-side code
Write-Host "Updating TypeScript configuration..."
$tsconfig = Get-Content -Raw -Path "tsconfig.json" | ConvertFrom-Json
if (-not $tsconfig.exclude) {
    $tsconfig | Add-Member -MemberType NoteProperty -Name "exclude" -Value @("node_modules")
}
if ($tsconfig.exclude -notcontains "src/server-lib/**/*") {
    $tsconfig.exclude += "src/server-lib/**/*"
}
$tsconfig | ConvertTo-Json -Depth 10 | Set-Content -Path "tsconfig.json"

# Build the project
Write-Host "Building project..."
npm run build

# Deploy to Vercel
Write-Host "Deploying to Vercel..."
vercel --prod

Write-Host "Deployment complete! Check the URL above for your live frontend."

# Return to original directory
Set-Location -Path ".." 