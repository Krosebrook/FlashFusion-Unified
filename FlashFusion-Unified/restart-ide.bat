@echo off
echo Restarting IDE and Development Environment...
echo.

echo 1. Killing existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo 2. Clearing npm cache...
cd /d "%~dp0"
npm cache clean --force >nul 2>&1

echo 3. Clearing Next.js cache for Lyra dashboard...
if exist "agents\lyra\dashboard\.next" (
    rmdir /s /q "agents\lyra\dashboard\.next" >nul 2>&1
)

echo 4. Reinstalling dependencies for Lyra dashboard...
cd "agents\lyra\dashboard"
npm install >nul 2>&1
cd /d "%~dp0"

echo 5. Starting FlashFusion main server...
start "FlashFusion Server" cmd /k "npm start"
timeout /t 3 >nul

echo 6. Starting Lyra dashboard...
start "Lyra Dashboard" cmd /k "cd agents\lyra\dashboard && npm run dev"
timeout /t 3 >nul

echo 7. Opening development URLs...
start "" "http://localhost:3000"
start "" "http://localhost:8080"

echo.
echo ✅ IDE and development environment restarted!
echo.
echo Main Server: http://localhost:8080
echo Lyra Dashboard: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul