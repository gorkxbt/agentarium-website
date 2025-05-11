@echo off
echo Starting Agentarium development server...
cd /d "%~dp0"
echo Current directory: %CD%

REM Try to start the development server
npm run dev

if %ERRORLEVEL% NEQ 0 (
  echo Error running npm command.
  echo Trying with PowerShell...
  powershell -Command "cd '%CD%'; npm run dev"
)

echo Press any key to exit...
pause 