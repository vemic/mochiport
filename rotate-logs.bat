@echo off
REM Log Rotation Script for MochiPort
REM Run this script weekly to rotate logs

set LOG_DIR=%~dp0logs
set ARCHIVE_DIR=%~dp0logs\archive
set MAX_SIZE=10485760
REM 10MB in bytes

echo Starting log rotation...

REM Create archive directory if it doesn't exist
if not exist "%ARCHIVE_DIR%" mkdir "%ARCHIVE_DIR%"

REM Get current date for archive naming
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
    set DATE=%%c-%%a-%%b
)

REM Function to rotate log if it exists and is larger than MAX_SIZE
for %%f in ("%LOG_DIR%\*.log") do (
    for %%s in ("%%f") do (
        if %%~zs gtr %MAX_SIZE% (
            echo Rotating log file: %%~nxf
            move "%%f" "%ARCHIVE_DIR%\%%~nf_%DATE%.log"
        )
    )
)

REM Restart PM2 to create new log files
pm2 restart ecosystem.config.json

REM Clean up archives older than 30 days
forfiles /p "%ARCHIVE_DIR%" /m *.log /d -30 /c "cmd /c del @path" 2>nul

echo Log rotation completed.
pause
