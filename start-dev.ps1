# PowerShell script to start the Agentarium development server
Write-Host "Starting Agentarium development server..." -ForegroundColor Green
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath
Write-Host "Current directory: $PWD" -ForegroundColor Cyan

try {
    Write-Host "Running npm development server..." -ForegroundColor Yellow
    npm run dev
}
catch {
    Write-Host "Error running npm command: $_" -ForegroundColor Red
    Write-Host "Please make sure Node.js is installed and try again." -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 