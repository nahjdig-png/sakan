@echo off
echo Installing Git for Windows...

REM Download Git installer
powershell -Command "Invoke-WebRequest -Uri 'https://git-scm.com/download/win' -UseBasicParsing | Select-Object -ExpandProperty Content" > temp.html

REM Install Git using downloaded installer
echo Please download Git manually from: https://git-scm.com/download/win
echo After installation, restart PowerShell and run the following commands:

echo.
echo cd "c:\Users\ali.salah\Desktop\sakan"
echo git init
echo git add .
echo git commit -m "Fix authentication and API endpoints"
echo git remote add origin [YOUR_GITHUB_REPO_URL]
echo git push -u origin main

pause