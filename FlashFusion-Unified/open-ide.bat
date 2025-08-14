@echo off
echo 🚀 Opening FlashFusion IDE Environment
echo =====================================
echo.

echo 1. Starting development servers...
start "Main Server" cmd /k "npm start"
timeout /t 2 >nul
start "Lyra Dashboard" cmd /k "cd agents\lyra\dashboard && npm run dev"
timeout /t 3 >nul

echo 2. Opening IDE...
echo    - Looking for Cursor IDE...
if exist "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" (
    echo    ✓ Found Cursor IDE
    start "" "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" .
) else if exist "%PROGRAMFILES%\Cursor\Cursor.exe" (
    echo    ✓ Found Cursor IDE
    start "" "%PROGRAMFILES%\Cursor\Cursor.exe" .
) else (
    echo    - Looking for VS Code...
    if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
        echo    ✓ Found VS Code
        start "" "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" .
    ) else if exist "%PROGRAMFILES%\Microsoft VS Code\Code.exe" (
        echo    ✓ Found VS Code
        start "" "%PROGRAMFILES%\Microsoft VS Code\Code.exe" .
    ) else (
        echo    ⚠️  No IDE found - please open manually
        echo       Open this folder in your preferred IDE:
        echo       %CD%
    )
)

timeout /t 3 >nul

echo 3. Opening development URLs...
start "" "http://localhost:3000"
start "" "http://localhost:8080"

echo.
echo ✅ IDE Environment Ready!
echo.
echo 📊 Development URLs:
echo    • Lyra Dashboard: http://localhost:3000
echo    • Main Server:    http://localhost:8080
echo.
echo 💡 IDE Features Available:
echo    • Auto-formatting on save
echo    • ESLint integration
echo    • TypeScript IntelliSense
echo    • Debug configurations
echo    • Git integration
echo.
pause