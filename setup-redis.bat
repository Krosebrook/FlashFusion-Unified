@echo off
echo ===============================================
echo FlashFusion Redis 8.0.3 Setup Script
echo ===============================================
echo.

REM Check if Redis directory exists
if not exist "C:\Redis" (
    echo Creating Redis directory...
    mkdir C:\Redis
)

echo Redis Setup Instructions:
echo.
echo 1. Download Redis 8.0.3 for Windows:
echo    URL: https://github.com/redis-windows/redis-windows/releases/tag/8.0.3
echo    File: Redis-8.0.3-Windows-x64-msys2.zip (11.4 MB)
echo.
echo 2. Extract the downloaded zip file to C:\Redis\
echo    You should have: C:\Redis\redis-server.exe
echo.
echo 3. Start Redis server:
echo    cd C:\Redis
echo    redis-server.exe
echo.
echo 4. Test Redis connection:
echo    redis-cli.exe ping
echo    (Should return: PONG)
echo.
echo 5. Your FlashFusion .env is already configured with:
echo    REDIS_URL=redis://localhost:6379
echo    REDIS_HOST=localhost
echo    REDIS_PORT=6379
echo.
echo 6. Restart FlashFusion backend to connect to Redis:
echo    node src/backend-server.js
echo.
echo ===============================================

REM Check if Redis is already installed
if exist "C:\Redis\redis-server.exe" (
    echo Redis appears to be installed at C:\Redis\
    echo.
    echo Starting Redis server...
    cd /d C:\Redis
    start "Redis Server" redis-server.exe
    echo.
    echo Redis server started! Check the Redis Server window.
    echo.
    timeout /t 3 >nul
    echo Testing Redis connection...
    redis-cli.exe ping
    echo.
) else (
    echo Redis not found at C:\Redis\
    echo Please download and extract Redis first.
    echo.
)

echo ===============================================
echo FlashFusion Redis Setup Complete!
echo ===============================================
pause