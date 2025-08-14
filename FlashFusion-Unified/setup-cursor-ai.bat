@echo off
echo Setting up Cursor AI enhancements...
echo.

echo Installing AI development tools...
call npm install -g aicommits @antfu/ni ts-node typescript

echo.
echo Creating local development tools...
call npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier

echo.
echo Setup complete! Next steps:
echo 1. Open cursor-setup.md for detailed instructions
echo 2. Install recommended extensions in Cursor (Ctrl+Shift+X)
echo 3. Configure your GitHub token for MCP
echo 4. Set up aicommits: aicommits config set OPENAI_KEY=your_key
echo.
pause