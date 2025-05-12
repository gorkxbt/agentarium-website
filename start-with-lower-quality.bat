@echo off
echo Setting up Agentarium in Low Quality Mode...

:: Set quality preference to minimal in local storage
echo Creating low quality configuration...
echo var ls=window.localStorage;ls.setItem('agentarium_reduced_quality','true');ls.setItem('agentarium_quality','minimal'); > temp_script.js

:: Run the script with Node.js if available, otherwise just set a flag file
where node >nul 2>nul
if %errorlevel% equ 0 (
  node temp_script.js
  del temp_script.js
) else (
  echo > .use_minimal_quality
)

:: Start the development server
echo Starting development server in compatibility mode...
start cmd /c "powershell -ExecutionPolicy Bypass -File start-dev.ps1"

:: Open browser with some delay
timeout /t 5 > nul
start "" http://localhost:3000

echo.
echo If the 3D visualization fails to load:
echo 1. Try refreshing the page
echo 2. Click "Try Simple Mode" button if prompted
echo 3. Update your graphics drivers if issues persist
echo. 