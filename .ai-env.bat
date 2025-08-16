@echo off
REM AI CLI Environment Configuration
REM Source this file to set up your AI environment
REM Usage: call .ai-env.bat

echo Loading AI CLI environment...

REM Set API keys (replace with your actual keys)
REM set ANTHROPIC_API_KEY=sk-ant-your-key-here
REM set OPENAI_API_KEY=sk-your-openai-key-here  
REM set GEMINI_API_KEY=your-gemini-key-here

REM AI CLI Aliases
doskey ai-claude=ai claude $*
doskey ai-gpt=ai gpt $*
doskey ai-gemini=ai gemini $*
doskey ai-local=ai local $*
doskey ai-free=ai free $*
doskey ai-code=ai code $*
doskey ai-compare=ai compare $*

REM Quick shortcuts
doskey c=ai claude $*
doskey g=ai gpt $*
doskey gem=ai gemini $*
doskey l=ai local $*
doskey f=ai free $*

REM Development shortcuts
doskey fix=ai code "Fix this code: $*"
doskey explain=ai claude "Explain this: $*"
doskey optimize=ai code "Optimize this code: $*"
doskey debug=ai gpt "Debug this error: $*"
doskey refactor=ai code "Refactor this code: $*"

REM Pipe helpers
doskey aifix=type $1 ^| ai code "Fix this code"
doskey aiexplain=type $1 ^| ai claude "Explain this code"
doskey aidoc=type $1 ^| ai code "Add documentation to this code"
doskey aitest=type $1 ^| ai code "Write tests for this code"

echo ✓ AI environment loaded!
echo.
echo Available commands:
echo   Direct: ai-claude, ai-gpt, ai-gemini, ai-local, ai-free
echo   Shortcuts: c, g, gem, l, f
echo   Dev tools: fix, explain, optimize, debug, refactor
echo   File helpers: aifix, aiexplain, aidoc, aitest
echo.
echo Examples:
echo   c "write a python function"
echo   fix "my broken code here"
echo   aiexplain myfile.py
echo   type error.log ^| debug