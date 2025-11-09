@echo off
echo ====================================
echo Starting n8n...
echo ====================================
echo.

REM Check if n8n is installed
where n8n >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: n8n is not installed!
    echo Run setup-n8n.bat first to install n8n
    pause
    exit /b 1
)

echo n8n is starting...
echo.
echo Access n8n at: http://localhost:5678
echo.
echo Press Ctrl+C to stop n8n
echo.

REM Start n8n with environment variables from .env file
n8n start

pause
