@echo off
cd /d "c:\Users\Erik_\OneDrive\Desktop\news app\news-app"
git add -A
git commit -m "Add .env.local and restore all code from backup"
git push origin main --force
pause
