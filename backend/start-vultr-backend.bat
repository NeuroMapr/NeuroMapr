@echo off
echo ========================================
echo Starting NeuroMapr Vultr Backend
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop
echo.

node src.old/index.js
