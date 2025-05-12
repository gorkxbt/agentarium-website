@echo off
echo Starting Agentarium with WebGL initialization fix...

:: Navigate to the project directory
cd %~dp0

:: Create marker file to indicate we should use the WebGL initialization page
echo > .\public\.use_webgl_init

:: Make sure the development server isn't already running
taskkill /f /im node.exe >nul 2>&1

:: Start the development server
echo Starting Next.js development server...
start /B cmd /c "powershell -ExecutionPolicy Bypass -Command npm run dev"

:: Wait for server to start
echo Waiting for server to start...
timeout /t 5 > nul

:: Open browser to the WebGL initialization page
echo Opening WebGL initialization page...
start "" "http://localhost:3000/webgl-init.html"

echo.
echo If the browser doesn't open automatically, please go to:
echo http://localhost:3000/webgl-init.html
echo.
echo Follow the instructions in the browser window to initialize WebGL.
echo. 