@echo off
echo.
echo 🎯 FlashFusion CLI Demo
echo ====================
echo.

echo 1. Checking CLI installation...
node ff-cli.js version
echo.

echo 2. System status check...
node ff-cli.js status
echo.

echo 3. Quick start guide...
node ff-cli.js quickstart
echo.

echo 4. Agent health check...
node ff-cli-extended.js agent:ping
echo.

echo 5. Running validator demo...
node ff-cli-extended.js validate:all
echo.

echo 6. Content generation demo...
node ff-cli-extended.js content:script
echo.

echo 7. Available commands...
node ff-cli.js help
echo.

echo 🎉 FlashFusion CLI Demo Complete!
echo.
echo 💡 Ready to start building? Run: node ff-cli.js quickstart
echo.
pause