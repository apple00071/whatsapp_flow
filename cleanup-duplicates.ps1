# Cleanup script to remove duplicate frontend code
Write-Host "Cleaning up duplicate frontend code..."

# Remove frontend components
Write-Host "Removing frontend components..."
if (Test-Path src/components) {
    Remove-Item -Path src/components -Recurse -Force
    Write-Host "Frontend components removed."
} else {
    Write-Host "Frontend components directory not found."
}

# Remove frontend app code
Write-Host "Removing frontend app code..."
if (Test-Path src/app) {
    Remove-Item -Path src/app -Recurse -Force
    Write-Host "Frontend app code removed."
} else {
    Write-Host "Frontend app directory not found."
}

# Keep only backend-specific code in src/lib
Write-Host "Cleaning up lib directory..."
$filesToKeep = @("messageQueue.js", "whatsappClient.js", "logger.js", "types.js")
$libFiles = Get-ChildItem -Path src/lib -File
foreach ($file in $libFiles) {
    if ($filesToKeep -notcontains $file.Name) {
        Remove-Item -Path $file.FullName -Force
        Write-Host "Removed $($file.Name)"
    }
}

# Clean up node_modules from the main project if they exist in frontend-deploy
Write-Host "Cleaning up node_modules..."
if ((Test-Path frontend-deploy/node_modules) -and (Test-Path node_modules)) {
    Remove-Item -Path node_modules -Recurse -Force
    Write-Host "Node modules removed from main project."
}

Write-Host "Cleanup complete!" 