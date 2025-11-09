@echo off
echo ====================================
echo n8n Setup Script for Windows
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm version:
npm --version
echo.

echo ====================================
echo Installing n8n globally...
echo ====================================
npm install -g n8n

if %errorlevel% neq 0 (
    echo ERROR: Failed to install n8n
    pause
    exit /b 1
)

echo.
echo ====================================
echo n8n installed successfully!
echo ====================================
echo.
echo To start n8n, run: n8n start
echo.
echo n8n will be available at: http://localhost:5678
echo.
echo Next steps:
echo 1. Start n8n: n8n start
echo 2. Open http://localhost:5678 in your browser
echo 3. Import workflow files from ./workflows/ directory
echo 4. Configure credentials for each service
echo 5. Test each workflow
echo.
echo For more information, see README.md
echo.

pause
