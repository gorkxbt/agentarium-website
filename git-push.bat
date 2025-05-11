@echo off
cd /d D:\projetAI\agentarium-website
git add vercel.json public/
git commit -m "Fix 404 error with improved Vercel configuration and static fallback"
git push origin master
echo Pushed changes to GitHub
pause 