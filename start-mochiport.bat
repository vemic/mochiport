@echo off
REM MochiPort Windows Startup Script
REM This script starts the MochiPort application on Windows

echo Starting MochiPort Application...

REM Change to application directory
cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 22.16.0 or later
    pause
    exit /b 1
)

REM Check if yarn is installed
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Yarn is not installed or not in PATH
    echo Please install Yarn package manager
    pause
    exit /b 1
)

REM Check if PM2 is installed globally, if not install it
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2 globally...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install PM2
        pause
        exit /b 1
    )
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Build the application
echo Building application...
call yarn install --frozen-lockfile
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

call yarn build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

REM Stop any existing PM2 processes
echo Stopping existing processes...
pm2 stop ecosystem.config.json >nul 2>&1
pm2 delete ecosystem.config.json >nul 2>&1

REM Start the application with PM2
echo Starting MochiPort with PM2...
pm2 start ecosystem.config.json --env production

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo MochiPort Application Started Successfully!
    echo ========================================
    echo Backend: http://localhost:7071
    echo Frontend: http://localhost:3000
    echo.
    echo To check status: pm2 status
    echo To view logs: pm2 logs
    echo To stop: pm2 stop ecosystem.config.json
    echo ========================================
    echo.
    
    REM Save PM2 configuration for auto-startup
    pm2 save
    
    REM Setup PM2 to start on Windows boot (requires admin privileges)
    echo Setting up auto-startup (requires admin privileges)...
    pm2 startup
    
) else (
    echo ERROR: Failed to start application
    pause
    exit /b 1
)

pause
