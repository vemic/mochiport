@echo off
REM MochiPort Automated Backup System
REM Backs up application data, configurations, and logs

setlocal enabledelayedexpansion

REM Configuration
set "APP_DIR=%~dp0.."
set "BACKUP_DIR=%APP_DIR%\data\backups"
set "TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "BACKUP_NAME=mochiport_backup_!TIMESTAMP!"
set "FULL_BACKUP_PATH=%BACKUP_DIR%\!BACKUP_NAME!"

echo ========================================
echo MochiPort Backup System
echo ========================================
echo Backup Name: !BACKUP_NAME!
echo Backup Path: !FULL_BACKUP_PATH!
echo.

REM Create backup directory structure
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
mkdir "!FULL_BACKUP_PATH!"
mkdir "!FULL_BACKUP_PATH!\config"
mkdir "!FULL_BACKUP_PATH!\logs"
mkdir "!FULL_BACKUP_PATH!\data"
mkdir "!FULL_BACKUP_PATH!\database"

cd /d "%APP_DIR%"

echo Backing up configuration files...
copy /Y "package.json" "!FULL_BACKUP_PATH!\config\" >nul
copy /Y "ecosystem.config.json" "!FULL_BACKUP_PATH!\config\" >nul
copy /Y "turbo.json" "!FULL_BACKUP_PATH!\config\" >nul
copy /Y ".env.*" "!FULL_BACKUP_PATH!\config\" >nul 2>&1
copy /Y "backend\.env.*" "!FULL_BACKUP_PATH!\config\" >nul 2>&1
copy /Y "frontend\.env.*" "!FULL_BACKUP_PATH!\config\" >nul 2>&1

echo Backing up logs...
if exist "logs" (
    xcopy "logs\*" "!FULL_BACKUP_PATH!\logs\" /E /I /Y >nul
)

echo Backing up PM2 configuration...
pm2 save --force >nul 2>&1
if exist "%USERPROFILE%\.pm2" (
    xcopy "%USERPROFILE%\.pm2\dump.pm2" "!FULL_BACKUP_PATH!\config\" /Y >nul 2>&1
)

REM Backup Supabase data (if using local instance)
echo Backing up database configuration...
copy /Y "backend\src\config\supabase.ts" "!FULL_BACKUP_PATH!\database\" >nul 2>&1
copy /Y "backend\database\*.sql" "!FULL_BACKUP_PATH!\database\" >nul 2>&1

REM Create backup manifest
echo Creating backup manifest...
echo Backup Created: %date% %time% > "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo Backup Name: !BACKUP_NAME! >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo Application Directory: %APP_DIR% >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo. >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo Contents: >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo - Configuration files (package.json, ecosystem.config.json, .env files) >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo - Application logs >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo - PM2 configuration >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo - Database configuration >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"

REM Get application version
for /f "tokens=2 delims=:" %%a in ('findstr "version" package.json') do (
    set "VERSION=%%a"
    set "VERSION=!VERSION: =!"
    set "VERSION=!VERSION:"=!"
    set "VERSION=!VERSION:,=!"
)
echo Application Version: !VERSION! >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"

REM Get system information
echo. >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
echo System Information: >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"
systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type" /C:"Total Physical Memory" >> "!FULL_BACKUP_PATH!\BACKUP_INFO.txt"

REM Compress backup (requires 7-Zip or PowerShell)
echo Compressing backup...
powershell -Command "Compress-Archive -Path '!FULL_BACKUP_PATH!' -DestinationPath '!FULL_BACKUP_PATH!.zip' -CompressionLevel Optimal" >nul 2>&1

if exist "!FULL_BACKUP_PATH!.zip" (
    echo Removing temporary directory...
    rmdir /S /Q "!FULL_BACKUP_PATH!"
    set "FINAL_BACKUP=!FULL_BACKUP_PATH!.zip"
) else (
    set "FINAL_BACKUP=!FULL_BACKUP_PATH!"
)

echo.
echo ========================================
echo Backup Completed Successfully!
echo ========================================
echo Backup Location: !FINAL_BACKUP!
echo.

REM Cleanup old backups (keep last 10)
echo Cleaning up old backups...
set "BACKUP_COUNT=0"
for /f "skip=10 delims=" %%f in ('dir /b /o-d "%BACKUP_DIR%\mochiport_backup_*"') do (
    echo Removing old backup: %%f
    if exist "%BACKUP_DIR%\%%f" (
        if "%%~xf"==".zip" (
            del "%BACKUP_DIR%\%%f"
        ) else (
            rmdir /S /Q "%BACKUP_DIR%\%%f"
        )
    )
)

echo Backup process completed.
echo.

REM Optional: Upload to cloud storage
if "%UPLOAD_TO_CLOUD%"=="true" (
    echo Uploading to cloud storage...
    REM Add your cloud upload commands here
    REM Example for AWS S3: aws s3 cp "!FINAL_BACKUP!" s3://your-bucket/mochiport-backups/
    REM Example for Azure: az storage blob upload --file "!FINAL_BACKUP!" --container-name backups
)

endlocal
