@echo off
REM MochiPort Windows Stop Script

echo Stopping MochiPort Application...

cd /d "%~dp0"

REM Stop PM2 processes
pm2 stop ecosystem.config.json
pm2 delete ecosystem.config.json

echo MochiPort Application Stopped.
pause
