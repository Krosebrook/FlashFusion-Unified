@echo off
echo Setting up Unified AI CLI...

REM Add current directory to PATH for this session
set PATH=%PATH%;%~dp0

REM Make ai.bat executable from anywhere by copying to a PATH directory
if not exist "%USERPROFILE%\bin" mkdir "%USERPROFILE%\bin"
copy "%~dp0ai.bat" "%USERPROFILE%\bin\ai.bat" >nul
copy "%~dp0ai.ps1" "%USERPROFILE%\bin\ai.ps1" >nul

REM Add bin directory to user PATH permanently
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "userpath=%%B"
if not defined userpath set userpath=
echo %userpath% | find /i "%USERPROFILE%\bin" >nul
if %errorlevel% neq 0 (
    setx PATH "%userpath%;%USERPROFILE%\bin"
    echo Added %USERPROFILE%\bin to PATH
)

REM Create PowerShell alias
powershell -Command "if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }; Add-Content $PROFILE 'function ai { & \"%USERPROFILE%\bin\ai.ps1\" @args }'"

echo.
echo ✓ AI CLI setup complete!
echo.
echo You can now use these commands from anywhere:
echo   ai claude "your prompt"
echo   ai gpt "your prompt"  
echo   ai gemini "your prompt"
echo   ai local "your prompt"
echo   ai free "your prompt"
echo   ai compare "your prompt"
echo.
echo Shortcuts:
echo   ai c "prompt"  (claude)
echo   ai g "prompt"  (gpt)
echo   ai l "prompt"  (local)
echo   ai f "prompt"  (free)
echo.
echo Configuration:
echo   ai config    - Check installation status
echo   ai install   - Install all AI tools
echo   ai setup     - Configure API keys
echo   ai help      - Show detailed help
echo.
echo Please restart your command prompt or run:
echo   refreshenv
echo.
pause