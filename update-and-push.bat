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
git push origin master

echo.
echo If the push failed, you may need to force push.
echo WARNING: Force push will overwrite remote changes.
echo.
set /p force_push="Do you want to force push? (y/n): "
if "%force_push%"=="y" (
    echo Force pushing changes to GitHub...
    git push -f origin master
    echo Force push complete!
) else (
    echo Force push cancelled.
)

echo.
echo Update complete!
echo.
pause 