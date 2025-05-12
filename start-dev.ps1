# PowerShell script to start the Next.js development server
# This script properly handles the development server startup for Windows PowerShell

# Navigate to the project directory (if not already there)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

Write-Host "Starting Agentarium Website development server..." -ForegroundColor Cyan

# Clear any leftover .next directory to prevent stale cache issues
if (Test-Path ".next") {
    Write-Host "Clearing previous build cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
}

# Set NODE_OPTIONS to increase memory limit if needed
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Run the development server
Write-Host "Running npm dev command..." -ForegroundColor Green
npm run dev 