@echo off
echo.
echo ⚡ FlashFusion CLI Installation
echo ==============================
echo.

echo 1. Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

echo.
echo 2. Making CLI executable...
if not exist "ff-cli.js" (
    echo ❌ ff-cli.js not found in current directory
    echo    Make sure you're in the FlashFusion project root
    pause
    exit /b 1
)

echo ✅ CLI script found

echo.
echo 3. Installing CLI globally...
npm link >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Global install failed, using local install
    echo.
    echo 📝 Usage: npm run ff <command>
    echo    Example: npm run ff init
) else (
    echo ✅ CLI installed globally
    echo.
    echo 📝 Usage: ff <command>
    echo    Example: ff init
)

echo.
echo 4. Testing CLI installation...
node ff-cli.js version
if %errorlevel% neq 0 (
    echo ❌ CLI test failed
    pause
    exit /b 1
)

echo.
echo 🎉 FlashFusion CLI installed successfully!
echo.
echo 🚀 Quick Start:
echo    ff quickstart    - Get started guide
echo    ff init          - Initialize new project
echo    ff help          - Show all commands
echo    ff status        - Check system status
echo.
echo 📚 Full command list: ff help:all
echo.
pause