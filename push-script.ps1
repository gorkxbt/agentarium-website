# PowerShell script to push to GitHub with detailed error output
Write-Host "Agentarium Website Push Script" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

try {
    Write-Host "Checking git status..." -ForegroundColor Cyan
    git status
    
    Write-Host "`nAttempting to push to master branch..." -ForegroundColor Cyan
    $pushOutput = git push origin master 2>&1
    Write-Host $pushOutput
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nPush failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Error output: $pushOutput" -ForegroundColor Red
        
        Write-Host "`nWould you like to try a force push? (WARNING: This will overwrite remote changes)" -ForegroundColor Yellow
        $forcePush = Read-Host "Force push? (y/n)"
        
        if ($forcePush -eq "y") {
            Write-Host "`nForce pushing to master branch..." -ForegroundColor Yellow
            git push -f origin master
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Force push successful!" -ForegroundColor Green
            } else {
                Write-Host "Force push failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            }
        } else {
            Write-Host "Force push cancelled." -ForegroundColor Cyan
        }
    } else {
        Write-Host "`nPush successful!" -ForegroundColor Green
    }
}
catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 