@echo off
setlocal enabledelayedexpansion

REM Unified AI CLI - Access all AI models from command prompt
REM Usage: ai [model] "prompt" or ai config

if "%1"=="config" goto :config
if "%1"=="list" goto :list
if "%1"=="install" goto :install
if "%1"=="help" goto :help
if "%1"=="" goto :help

set MODEL=%1
shift
set PROMPT=%*

REM Remove quotes from prompt if present
set PROMPT=!PROMPT:"=!

REM Route to appropriate AI tool based on model
if /i "!MODEL!"=="claude" goto :claude
if /i "!MODEL!"=="gpt" goto :gpt
if /i "!MODEL!"=="gpt4" goto :gpt4
if /i "!MODEL!"=="gemini" goto :gemini
if /i "!MODEL!"=="local" goto :local
if /i "!MODEL!"=="llama" goto :local
if /i "!MODEL!"=="free" goto :free
if /i "!MODEL!"=="compare" goto :compare
if /i "!MODEL!"=="code" goto :code

echo Unknown model: !MODEL!
echo Use 'ai list' to see available models
exit /b 1

:claude
echo [Claude]
claude "!PROMPT!"
exit /b

:gpt
echo [GPT-4]
if exist "%USERPROFILE%\.config\shell_gpt\config.yml" (
    sgpt --model gpt-4 "!PROMPT!"
) else (
    echo Shell-GPT not configured. Run: ai install
)
exit /b

:gpt4
goto :gpt

:gemini
echo [Gemini Pro]
if exist "%USERPROFILE%\node_modules\.bin\aichat.cmd" (
    aichat -m gemini-pro "!PROMPT!"
) else if exist "%USERPROFILE%\AppData\Roaming\npm\aichat.cmd" (
    aichat -m gemini-pro "!PROMPT!"
) else (
    echo AIChat not installed. Run: ai install
)
exit /b

:local
echo [Local Llama]
if exist "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe" (
    ollama run llama2 "!PROMPT!"
) else (
    echo Ollama not installed. Run: ai install
)
exit /b

:free
echo [Free AI - No API Key Needed]
if exist "%USERPROFILE%\go\bin\tgpt.exe" (
    tgpt "!PROMPT!"
) else if exist "C:\Program Files\tgpt\tgpt.exe" (
    "C:\Program Files\tgpt\tgpt.exe" "!PROMPT!"
) else (
    echo tgpt not installed. Run: ai install
)
exit /b

:code
echo [Code-focused AI]
if exist "%USERPROFILE%\node_modules\.bin\aichat.cmd" (
    aichat -m claude-3-sonnet -r code "!PROMPT!"
) else (
    claude "!PROMPT!"
)
exit /b

:compare
echo ====== AI Model Comparison ======
echo.
echo [Claude Response:]
claude "!PROMPT!"
echo.
echo [GPT-4 Response:]
if exist "%USERPROFILE%\.config\shell_gpt\config.yml" (
    sgpt --model gpt-4 "!PROMPT!"
) else (
    echo Shell-GPT not configured
)
echo.
echo [Gemini Response:]
if exist "%USERPROFILE%\AppData\Roaming\npm\aichat.cmd" (
    aichat -m gemini-pro "!PROMPT!"
) else (
    echo AIChat not installed
)
echo.
echo ====== End Comparison ======
exit /b

:config
echo AI CLI Configuration
echo.
echo Checking installed tools...
echo.

REM Check Claude Code
where claude >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Claude Code: Installed
) else (
    echo ✗ Claude Code: Not found
)

REM Check Shell-GPT
where sgpt >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Shell-GPT: Installed
) else (
    echo ✗ Shell-GPT: Not found
)

REM Check AIChat
where aichat >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ AIChat: Installed
) else (
    echo ✗ AIChat: Not found
)

REM Check Ollama
where ollama >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Ollama: Installed
) else (
    echo ✗ Ollama: Not found
)

REM Check tgpt
where tgpt >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ tgpt: Installed
) else (
    echo ✗ tgpt: Not found
)

echo.
echo API Key Status:
if defined ANTHROPIC_API_KEY (
    echo ✓ Claude API Key: Set
) else (
    echo ✗ Claude API Key: Not set
)

if defined OPENAI_API_KEY (
    echo ✓ OpenAI API Key: Set
) else (
    echo ✗ OpenAI API Key: Not set
)

if defined GEMINI_API_KEY (
    echo ✓ Gemini API Key: Set
) else (
    echo ✗ Gemini API Key: Not set
)

echo.
echo Run 'ai install' to install missing tools
exit /b

:list
echo Available AI Models:
echo.
echo   ai claude "prompt"     - Claude (Anthropic)
echo   ai gpt "prompt"        - GPT-4 (OpenAI)
echo   ai gemini "prompt"     - Gemini Pro (Google)
echo   ai local "prompt"      - Local Llama (Ollama)
echo   ai free "prompt"       - Free AI (no API key)
echo   ai code "prompt"       - Code-focused AI
echo   ai compare "prompt"    - Compare all models
echo.
echo Special commands:
echo   ai config              - Check installation status
echo   ai install             - Install all AI tools
echo   ai list                - Show this list
echo   ai help                - Show detailed help
exit /b

:install
echo Installing AI CLI Tools...
echo.

REM Install Node.js tools
echo Installing Node.js AI tools...
call npm install -g @anthropic/claude-code
call npm install -g aichat-cli

REM Install Python tools
echo Installing Python AI tools...
call pip install shell-gpt
call pip install openai
call pip install google-generativeai

REM Install Ollama
echo Installing Ollama...
powershell -Command "& {Invoke-WebRequest -Uri 'https://ollama.ai/download/windows' -OutFile '%TEMP%\OllamaSetup.exe'; Start-Process '%TEMP%\OllamaSetup.exe' -Wait}"

REM Install tgpt
echo Installing tgpt...
powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/aandrew-me/tgpt/releases/latest/download/tgpt_windows_amd64.zip' -OutFile '%TEMP%\tgpt.zip'; Expand-Archive '%TEMP%\tgpt.zip' -DestinationPath '%USERPROFILE%\go\bin\' -Force}"

echo.
echo Installation complete!
echo Run 'ai config' to verify installation
echo.
echo Next steps:
echo 1. Set your API keys:
echo    set ANTHROPIC_API_KEY=your_claude_key
echo    set OPENAI_API_KEY=your_openai_key
echo    set GEMINI_API_KEY=your_gemini_key
echo.
echo 2. Test with: ai claude "Hello world"
exit /b

:help
echo Unified AI CLI - Access all AI models from command prompt
echo.
echo Usage:
echo   ai [model] "your prompt here"
echo.
echo Available models:
echo   claude     - Claude (best for coding, conversations)
echo   gpt        - GPT-4 (OpenAI's flagship model)
echo   gemini     - Gemini Pro (Google's multimodal AI)
echo   local      - Local Llama (runs offline, no API key)
echo   free       - Free AI (no API key needed)
echo   code       - Code-focused AI (optimized for programming)
echo   compare    - Compare responses from all models
echo.
echo Examples:
echo   ai claude "Write a Python function to sort a list"
echo   ai gpt "Explain quantum computing"
echo   ai gemini "Create a marketing plan"
echo   ai local "What is machine learning?"
echo   ai free "Write a haiku about coding"
echo   ai compare "Best practices for REST APIs"
echo.
echo Configuration:
echo   ai config    - Check what's installed and configured
echo   ai install   - Install all AI tools automatically
echo   ai list      - List all available models
echo.
echo Pipe support:
echo   echo "Fix this code" | ai claude
echo   type file.py | ai code "Add comments"
echo.
echo Environment variables (optional):
echo   ANTHROPIC_API_KEY - Your Claude API key
echo   OPENAI_API_KEY    - Your OpenAI API key
echo   GEMINI_API_KEY    - Your Google API key
exit /b