# PowerShell script to start the Next.js development server
Write-Host "Starting Agentarium development server..." -ForegroundColor Green

try {
    # Change to the project directory if needed
    # cd "$(Split-Path -Parent $MyInvocation.MyCommand.Path)"
    
    # Run the development server
    npm run dev
}
catch {
    Write-Host "Error starting development server: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 