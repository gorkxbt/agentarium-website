@echo off
echo Agentarium Website Update Script
echo ===============================

echo Updating the repository...
git add .

echo.
echo Enter your commit message:
set /p commit_message="Commit message: "

echo.
echo Committing changes with message: "%commit_message%"
git commit -m "%commit_message%"

echo.
echo Pushing changes to GitHub...
git push origin main

echo.
echo Update complete! Changes have been pushed to GitHub.
echo.
pause 