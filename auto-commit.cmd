@echo off
REM Auto-commit script for FlashFusion-Unified
REM Automatically stages and commits all changes

echo Starting auto-commit...

REM Add all changes
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% neq 0 (
    REM Create simple timestamp
    set "timestamp=%date% %time%"
    
    REM Commit with timestamp
    git commit -m "Auto-commit: %timestamp%" -m "Generated with FlashFusion Auto-Commit System" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
    
    if %errorlevel% equ 0 (
        echo Auto-commit successful!
    ) else (
        echo Auto-commit failed!
        exit /b 1
    )
) else (
    echo No changes to commit.
)