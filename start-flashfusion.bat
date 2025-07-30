@echo off
title FlashFusion-United Development Environment
cd /d "C:\Users\kyler\Downloads\flashfusion-united"

echo ========================================
echo   🚀 FlashFusion-United Dev Environment
echo ========================================
echo.
echo Choose your setup:
echo 1. Full Development (Local + Docker + Supabase)
echo 2. Local Development Only
echo 3. Docker Development
echo 4. Deploy to Replit
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto full_dev
if "%choice%"=="2" goto local_dev
if "%choice%"=="3" goto docker_dev
if "%choice%"=="4" goto replit_deploy
if "%choice%"=="5" goto exit
echo Invalid choice. Starting local development...

:local_dev
echo.
echo 🌐 Starting Local Development...
echo ========================================
echo.

REM Start the development server
echo 📦 Installing/updating dependencies...
npm install

echo 🌐 Starting React development server...
start "FlashFusion Dev Server" cmd /k "npm run dev"

REM Open Cursor IDE (with VS Code fallback)
echo 💻 Opening Cursor IDE...
cursor . >nul 2>&1
if %errorlevel% neq 0 (
    echo Cursor not found, falling back to VS Code...
    code . >nul 2>&1
    if %errorlevel% neq 0 (
        echo No compatible IDE found. Please install Cursor or VS Code.
    )
)

REM Open browser
echo 🌍 Opening browser...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo ✅ Local development environment ready!
echo 📍 App: http://localhost:5173
echo 💻 Cursor IDE opened
echo.
goto end

:full_dev
echo.
echo 🚀 Starting Full Development Environment...
echo ========================================
echo.

REM Check Docker
echo 🐳 Checking Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker to start...
    timeout /t 15 /nobreak >nul
)

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d supabase-db supabase-studio

REM Install dependencies
echo 📦 Installing/updating dependencies...
npm install

REM Start development server
echo 🌐 Starting React development server...
start "FlashFusion Dev Server" cmd /k "npm run dev"

REM Open Cursor IDE (with VS Code fallback)
echo 💻 Opening Cursor IDE...
cursor . >nul 2>&1
if %errorlevel% neq 0 (
    echo Cursor not found, falling back to VS Code...
    code . >nul 2>&1
    if %errorlevel% neq 0 (
        echo No compatible IDE found. Please install Cursor or VS Code.
    )
)

REM Open services
echo 🌍 Opening browser and services...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
start "" "http://localhost:54323"

echo.
echo ✅ Full development environment ready!
echo 📍 App: http://localhost:5173
echo 🗄️  Supabase Studio: http://localhost:54323
echo 💻 Cursor IDE opened
echo 🐳 Docker services running
echo.
goto end

:docker_dev
echo.
echo 🐳 Starting Docker Development...
echo ========================================
echo.

REM Build and start Docker
echo 🔨 Building Docker images...
docker-compose build flashfusion-dev

echo 🚀 Starting Docker development environment...
docker-compose up flashfusion-dev

echo.
echo ✅ Docker development environment ready!
echo 📍 App: http://localhost:5173
echo.
goto end

:replit_deploy
echo.
echo 🌐 Preparing Replit Deployment...
echo ========================================
echo.

REM Build for production
echo 🔨 Building for production...
npm run build

echo 📋 Replit deployment files created!
echo.
echo Next steps:
echo 1. Go to https://replit.com
echo 2. Create new Repl from GitHub or upload this folder
echo 3. Set environment variables in Secrets:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo 4. Run: npm install && npm run dev
echo.
echo 📖 See replit-setup.md for detailed instructions
echo.
start "" notepad replit-setup.md
goto end

:end
echo Press any key to exit...
pause >nul
goto exit

:exit
exit