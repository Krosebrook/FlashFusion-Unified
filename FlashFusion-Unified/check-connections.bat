@echo off
echo FlashFusion IDE Connection Health Check
echo =======================================
echo.

echo 1. Checking Node.js processes...
tasklist | findstr node.exe
echo.

echo 2. Checking network connections on common ports...
echo Port 3000 (Lyra Dashboard):
netstat -ano | findstr ":3000" || echo   Not listening
echo Port 8080 (Main Server):
netstat -ano | findstr ":8080" || echo   Not listening
echo.

echo 3. Testing localhost connectivity...
echo Testing Lyra Dashboard:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5; Write-Host '  Status:' $response.StatusCode } catch { Write-Host '  Connection failed:' $_.Exception.Message }"
echo Testing Main Server:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080' -TimeoutSec 5; Write-Host '  Status:' $response.StatusCode } catch { Write-Host '  Connection failed:' $_.Exception.Message }"
echo.

echo 4. Checking package.json scripts...
if exist "package.json" (
    echo Main package.json found ✓
) else (
    echo Main package.json missing ✗
)

if exist "agents\lyra\dashboard\package.json" (
    echo Lyra dashboard package.json found ✓
) else (
    echo Lyra dashboard package.json missing ✗
)
echo.

echo 5. Checking environment files...
if exist ".env" (
    echo .env file found ✓
) else (
    echo .env file missing - this might be normal
)
echo.

echo 6. Checking IDE configuration...
if exist ".vscode\settings.json" (
    echo VS Code settings found ✓
) else (
    echo VS Code settings missing ✗
)

if exist ".cursorrules" (
    echo Cursor rules found ✓
) else (
    echo Cursor rules missing ✗
)
echo.

echo Health Check Complete!
echo.
echo If you see connection failures, run: restart-ide.bat
echo.
pause