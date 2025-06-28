@echo off
REM MochiPort Windows Full Installation Script
REM This script performs complete installation and setup for standalone Windows deployment

echo ========================================
echo MochiPort Windows Standalone Installer
echo ========================================

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Set application directory
set "APP_DIR=%~dp0.."
cd /d "%APP_DIR%"

echo Current directory: %CD%
echo.

REM Create required directories
echo Creating required directories...
if not exist "logs" mkdir logs
if not exist "data\backups" mkdir data\backups
if not exist "config" mkdir config
if not exist "ssl" mkdir ssl

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 22.16.0 or later from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✓ Node.js is installed
)

REM Check Yarn
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Yarn is not installed
    echo Installing Yarn...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Yarn
        pause
        exit /b 1
    )
)
echo ✓ Yarn is available

REM Install PM2 globally
echo Installing PM2 globally...
npm install -g pm2
npm install -g pm2-windows-service
echo ✓ PM2 installed

REM Install dependencies and build
echo Installing dependencies...
call yarn install --frozen-lockfile
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo Building application...
call yarn build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

REM Create Windows Service
echo Setting up Windows Service...
pm2-service-install -n MochiPort

REM Configure PM2 startup
echo Configuring PM2 startup...
pm2 start ecosystem.config.json --env production
pm2 save
pm2 startup

REM Create firewall rules
echo Configuring Windows Firewall...
netsh advfirewall firewall add rule name="MochiPort Backend" dir=in action=allow protocol=TCP localport=7071
netsh advfirewall firewall add rule name="MochiPort Frontend" dir=in action=allow protocol=TCP localport=3000

REM Install monitoring tools
echo Installing additional monitoring tools...
npm install -g clinic
npm install -g autocannon

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Services:
echo - Backend: http://localhost:7071
echo - Frontend: http://localhost:3000
echo.
echo Management Commands:
echo - Start: pm2 start ecosystem.config.json
echo - Stop: pm2 stop all
echo - Status: pm2 status
echo - Logs: pm2 logs
echo - Monitor: pm2 monit
echo.
echo The application will start automatically on system boot.
echo ========================================

pause
