# Simple start script to run the app with minimal WebGL demands
Write-Host "Starting Agentarium with simplified 3D rendering..." -ForegroundColor Cyan

# Navigate to the correct directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Clean up any previous files and caches
if (Test-Path ".next") {
    Write-Host "Cleaning previous build cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
}

# Create a simple JavaScript file to set localStorage values
$jsContent = @"
// Set localStorage values for reduced graphics
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  
  // Force minimal rendering settings
  localStorage.setItem('webgl_initialized', 'true');
  
  console.log('Set minimal WebGL settings');
}
"@

# Write the file
Set-Content -Path ".\public\webgl-init.js" -Value $jsContent

# Check for node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Set NODE_OPTIONS to increase memory limit
$env:NODE_OPTIONS = "--max-old-space-size=2048"

# Run the dev server
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev 