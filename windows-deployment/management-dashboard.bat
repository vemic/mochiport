@echo off
REM MochiPort Windows Management Dashboard
REM Central management interface for all MochiPort operations

:MAIN_MENU
cls
echo ========================================
echo        MochiPort Management Dashboard
echo ========================================
echo Current Time: %date% %time%
echo.

REM Get current status
call :GET_STATUS

echo Current Status:
echo   Backend: %BACKEND_STATUS%
echo   Frontend: %FRONTEND_STATUS%
echo   System Load: %SYSTEM_LOAD%
echo.
echo ========================================
echo.
echo 1. Service Management
echo 2. Monitoring & Logs
echo 3. Backup & Recovery
echo 4. System Maintenance
echo 5. Configuration
echo 6. Performance Tools
echo 7. Troubleshooting
echo 8. Exit
echo.
set /p choice="Select option (1-8): "

if "%choice%"=="1" goto SERVICE_MENU
if "%choice%"=="2" goto MONITORING_MENU
if "%choice%"=="3" goto BACKUP_MENU
if "%choice%"=="4" goto MAINTENANCE_MENU
if "%choice%"=="5" goto CONFIG_MENU
if "%choice%"=="6" goto PERFORMANCE_MENU
if "%choice%"=="7" goto TROUBLESHOOTING_MENU
if "%choice%"=="8" goto EXIT
goto MAIN_MENU

:SERVICE_MENU
cls
echo ========================================
echo           Service Management
echo ========================================
echo.
echo 1. Start Services
echo 2. Stop Services
echo 3. Restart Services
echo 4. Service Status
echo 5. Install as Windows Service
echo 6. Uninstall Windows Service
echo 7. Back to Main Menu
echo.
set /p choice="Select option (1-7): "

if "%choice%"=="1" (
    echo Starting MochiPort services...
    pm2 start ecosystem.config.json --env production
    echo Press any key to continue...
    pause >nul
    goto SERVICE_MENU
)
if "%choice%"=="2" (
    echo Stopping MochiPort services...
    pm2 stop ecosystem.config.json
    echo Press any key to continue...
    pause >nul
    goto SERVICE_MENU
)
if "%choice%"=="3" (
    echo Restarting MochiPort services...
    pm2 restart ecosystem.config.json
    echo Press any key to continue...
    pause >nul
    goto SERVICE_MENU
)
if "%choice%"=="4" (
    pm2 status
    echo.
    pm2 info mochiport-backend
    echo.
    pm2 info mochiport-frontend
    echo Press any key to continue...
    pause >nul
    goto SERVICE_MENU
)
if "%choice%"=="5" (
    echo Installing as Windows Service...
    powershell -ExecutionPolicy Bypass -File ".\windows-deployment\setup-windows-service.ps1"
    echo Press any key to continue...
    pause >nul
    goto SERVICE_MENU
)
if "%choice%"=="6" (
    echo Uninstalling Windows Service...
    pm2-service-uninstall
    echo Press any key to continue...
    pause >nul
    goto SERVICE_MENU
)
if "%choice%"=="7" goto MAIN_MENU
goto SERVICE_MENU

:MONITORING_MENU
cls
echo ========================================
echo          Monitoring & Logs
echo ========================================
echo.
echo 1. View Live Logs
echo 2. View Error Logs
echo 3. PM2 Monitor
echo 4. System Resources
echo 5. Health Check
echo 6. Start Advanced Monitoring
echo 7. Performance Report
echo 8. Back to Main Menu
echo.
set /p choice="Select option (1-8): "

if "%choice%"=="1" (
    pm2 logs
)
if "%choice%"=="2" (
    echo Backend Errors:
    type logs\backend-error.log 2>nul | more
    echo.
    echo Frontend Errors:
    type logs\frontend-error.log 2>nul | more
    pause
    goto MONITORING_MENU
)
if "%choice%"=="3" (
    pm2 monit
)
if "%choice%"=="4" (
    echo System Resources:
    systeminfo | findstr /C:"Available Physical Memory" /C:"Virtual Memory"
    wmic cpu get loadpercentage /value
    wmic logicaldisk get size,freespace,caption
    echo Press any key to continue...
    pause >nul
    goto MONITORING_MENU
)
if "%choice%"=="5" (
    echo Performing health check...
    curl -s http://localhost:7071/api/health
    echo.
    curl -s http://localhost:3000
    echo Press any key to continue...
    pause >nul
    goto MONITORING_MENU
)
if "%choice%"=="6" (
    echo Starting advanced monitoring...
    start powershell -Command ".\windows-deployment\advanced-monitoring.ps1 -StartMonitoring"
    echo Advanced monitoring started in new window.
    echo Press any key to continue...
    pause >nul
    goto MONITORING_MENU
)
if "%choice%"=="7" (
    echo Generating performance report...
    powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Format-Table ProcessName, Id, CPU, WorkingSet -AutoSize"
    pm2 describe mochiport-backend
    echo Press any key to continue...
    pause >nul
    goto MONITORING_MENU
)
if "%choice%"=="8" goto MAIN_MENU
goto MONITORING_MENU

:BACKUP_MENU
cls
echo ========================================
echo          Backup & Recovery
echo ========================================
echo.
echo 1. Create Backup
echo 2. List Backups
echo 3. Restore from Backup
echo 4. Configure Auto-Backup
echo 5. Test Recovery System
echo 6. Start Recovery Service
echo 7. Back to Main Menu
echo.
set /p choice="Select option (1-7): "

if "%choice%"=="1" (
    echo Creating backup...
    call ".\windows-deployment\backup-system.bat"
    echo Press any key to continue...
    pause >nul
    goto BACKUP_MENU
)
if "%choice%"=="2" (
    echo Available backups:
    dir /B "data\backups\mochiport_backup_*" 2>nul
    echo Press any key to continue...
    pause >nul
    goto BACKUP_MENU
)
if "%choice%"=="3" (
    echo Available backups:
    dir /B "data\backups\mochiport_backup_*" 2>nul
    echo.
    set /p backup_name="Enter backup filename: "
    powershell -ExecutionPolicy Bypass -Command ".\windows-deployment\recovery-system.ps1 -RestoreFromBackup 'data\backups\%backup_name%'"
    echo Press any key to continue...
    pause >nul
    goto BACKUP_MENU
)
if "%choice%"=="4" (
    echo Configuring auto-backup...
    echo Creating scheduled task for daily backup...
    schtasks /create /tn "MochiPort Daily Backup" /tr "%CD%\windows-deployment\backup-system.bat" /sc daily /st 02:00 /f
    echo Auto-backup configured for 2:00 AM daily.
    echo Press any key to continue...
    pause >nul
    goto BACKUP_MENU
)
if "%choice%"=="5" (
    powershell -ExecutionPolicy Bypass -Command ".\windows-deployment\recovery-system.ps1 -TestRecovery"
    echo Press any key to continue...
    pause >nul
    goto BACKUP_MENU
)
if "%choice%"=="6" (
    echo Starting recovery service...
    start powershell -Command ".\windows-deployment\recovery-system.ps1 -StartRecoveryService"
    echo Recovery service started in new window.
    echo Press any key to continue...
    pause >nul
    goto BACKUP_MENU
)
if "%choice%"=="7" goto MAIN_MENU
goto BACKUP_MENU

:MAINTENANCE_MENU
cls
echo ========================================
echo         System Maintenance
echo ========================================
echo.
echo 1. Update Dependencies
echo 2. Clear Logs
echo 3. Clear Cache
echo 4. Rebuild Application
echo 5. Check Disk Space
echo 6. System Cleanup
echo 7. Update Application
echo 8. Back to Main Menu
echo.
set /p choice="Select option (1-8): "

if "%choice%"=="1" (
    echo Updating dependencies...
    yarn install
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="2" (
    echo Clearing logs...
    pm2 flush
    del /Q logs\*.log 2>nul
    echo Logs cleared.
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="3" (
    echo Clearing cache...
    yarn cache clean
    npm cache clean --force
    echo Cache cleared.
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="4" (
    echo Rebuilding application...
    pm2 stop ecosystem.config.json
    yarn clean
    yarn build
    pm2 start ecosystem.config.json --env production
    echo Application rebuilt and restarted.
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="5" (
    echo Checking disk space...
    wmic logicaldisk get size,freespace,caption
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="6" (
    echo Performing system cleanup...
    del /Q %TEMP%\* 2>nul
    del /Q logs\*.log.* 2>nul
    echo System cleanup completed.
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="7" (
    echo Updating application...
    git pull 2>nul || echo "No git repository found"
    yarn install
    yarn build
    pm2 restart ecosystem.config.json
    echo Application updated and restarted.
    echo Press any key to continue...
    pause >nul
    goto MAINTENANCE_MENU
)
if "%choice%"=="8" goto MAIN_MENU
goto MAINTENANCE_MENU

:CONFIG_MENU
cls
echo ========================================
echo           Configuration
echo ========================================
echo.
echo 1. View Environment Variables
echo 2. Edit Backend Config
echo 3. Edit Frontend Config
echo 4. View PM2 Config
echo 5. Network Configuration
echo 6. Security Settings
echo 7. Back to Main Menu
echo.
set /p choice="Select option (1-7): "

if "%choice%"=="1" (
    echo Backend Environment:
    type backend\.env.production 2>nul || echo "No backend .env.production found"
    echo.
    echo Frontend Environment:
    type frontend\.env.production 2>nul || echo "No frontend .env.production found"
    echo Press any key to continue...
    pause >nul
    goto CONFIG_MENU
)
if "%choice%"=="2" (
    notepad backend\.env.production
    goto CONFIG_MENU
)
if "%choice%"=="3" (
    notepad frontend\.env.production
    goto CONFIG_MENU
)
if "%choice%"=="4" (
    type ecosystem.config.json
    echo Press any key to continue...
    pause >nul
    goto CONFIG_MENU
)
if "%choice%"=="5" (
    echo Current network configuration:
    netstat -an | findstr ":3000\|:7071"
    echo.
    echo Firewall rules:
    netsh advfirewall firewall show rule name="MochiPort Backend" >nul 2>&1 && echo "✓ Backend firewall rule exists" || echo "✗ Backend firewall rule missing"
    netsh advfirewall firewall show rule name="MochiPort Frontend" >nul 2>&1 && echo "✓ Frontend firewall rule exists" || echo "✗ Frontend firewall rule missing"
    echo Press any key to continue...
    pause >nul
    goto CONFIG_MENU
)
if "%choice%"=="6" (
    echo Security Settings:
    echo - Firewall status: 
    netsh advfirewall show allprofiles state
    echo - Service accounts:
    whoami
    echo Press any key to continue...
    pause >nul
    goto CONFIG_MENU
)
if "%choice%"=="7" goto MAIN_MENU
goto CONFIG_MENU

:PERFORMANCE_MENU
cls
echo ========================================
echo          Performance Tools
echo ========================================
echo.
echo 1. Memory Monitor
echo 2. CPU Monitor
echo 3. Network Monitor
echo 4. Load Test
echo 5. Performance Profile
echo 6. Optimization Report
echo 7. Back to Main Menu
echo.
set /p choice="Select option (1-7): "

if "%choice%"=="1" (
    echo Starting memory monitor...
    start node memory-monitor-fixed.js
    echo Memory monitor started. Check the new window.
    echo Press any key to continue...
    pause >nul
    goto PERFORMANCE_MENU
)
if "%choice%"=="2" (
    echo CPU usage by Node.js processes:
    powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Sort-Object CPU -Descending | Format-Table ProcessName, Id, CPU, WorkingSet -AutoSize"
    echo Press any key to continue...
    pause >nul
    goto PERFORMANCE_MENU
)
if "%choice%"=="3" (
    echo Network connections:
    netstat -an | findstr ":3000\|:7071"
    echo Press any key to continue...
    pause >nul
    goto PERFORMANCE_MENU
)
if "%choice%"=="4" (
    echo Starting load test...
    echo This will test the backend API performance
    set /p confirm="Continue? (y/n): "
    if /i "%confirm%"=="y" (
        npx autocannon http://localhost:7071/api/health -d 30 -c 10
    )
    echo Press any key to continue...
    pause >nul
    goto PERFORMANCE_MENU
)
if "%choice%"=="5" (
    echo Generating performance profile...
    clinic doctor --on-port 'autocannon http://localhost:7071/api/health -d 10' -- node backend/dist/server.js
    echo Press any key to continue...
    pause >nul
    goto PERFORMANCE_MENU
)
if "%choice%"=="6" (
    echo Performance optimization report:
    call performance-check.bat
    echo Press any key to continue...
    pause >nul
    goto PERFORMANCE_MENU
)
if "%choice%"=="7" goto MAIN_MENU
goto PERFORMANCE_MENU

:TROUBLESHOOTING_MENU
cls
echo ========================================
echo         Troubleshooting
echo ========================================
echo.
echo 1. Port Conflict Check
echo 2. Dependency Issues
echo 3. Memory Issues
echo 4. Network Issues
echo 5. Database Connection
echo 6. Common Solutions
echo 7. Generate Support Report
echo 8. Back to Main Menu
echo.
set /p choice="Select option (1-8): "

if "%choice%"=="1" (
    echo Checking port conflicts...
    echo Port 3000 (Frontend):
    netstat -an | findstr ":3000"
    echo Port 7071 (Backend):
    netstat -an | findstr ":7071"
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="2" (
    echo Checking dependencies...
    node --version
    yarn --version
    pm2 --version
    echo.
    echo Checking node_modules...
    if exist node_modules (echo "✓ Root node_modules exists") else (echo "✗ Root node_modules missing")
    if exist backend\node_modules (echo "✓ Backend node_modules exists") else (echo "✗ Backend node_modules missing")
    if exist frontend\node_modules (echo "✓ Frontend node_modules exists") else (echo "✗ Frontend node_modules missing")
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="3" (
    echo Memory usage analysis:
    powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Sort-Object WorkingSet64 -Descending | Format-Table ProcessName, Id, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet64/1MB,2)}} -AutoSize"
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="4" (
    echo Network diagnostics:
    ping -n 4 localhost
    telnet localhost 3000
    telnet localhost 7071
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="5" (
    echo Testing database connection...
    curl -s http://localhost:7071/api/health
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="6" (
    echo Common Solutions:
    echo 1. Restart services: pm2 restart ecosystem.config.json
    echo 2. Clear cache: yarn cache clean
    echo 3. Rebuild: yarn clean ^&^& yarn build
    echo 4. Check logs: pm2 logs
    echo 5. Check ports: netstat -an ^| findstr ":3000\|:7071"
    echo 6. Update dependencies: yarn install
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="7" (
    echo Generating support report...
    echo Collecting system information...
    (
        echo MochiPort Support Report
        echo ========================
        echo Date: %date% %time%
        echo.
        echo System Information:
        systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type" /C:"Total Physical Memory"
        echo.
        echo Node.js Information:
        node --version
        yarn --version
        pm2 --version
        echo.
        echo Service Status:
        pm2 status
        echo.
        echo Port Usage:
        netstat -an | findstr ":3000\|:7071"
        echo.
        echo Recent Errors:
        echo Backend Errors:
        tail -n 20 logs\backend-error.log 2>nul
        echo Frontend Errors:
        tail -n 20 logs\frontend-error.log 2>nul
    ) > support-report-%date:~10,4%%date:~4,2%%date:~7,2%.txt
    echo Support report generated: support-report-%date:~10,4%%date:~4,2%%date:~7,2%.txt
    echo Press any key to continue...
    pause >nul
    goto TROUBLESHOOTING_MENU
)
if "%choice%"=="8" goto MAIN_MENU
goto TROUBLESHOOTING_MENU

:GET_STATUS
REM Get current service status
pm2 jlist >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('pm2 jlist ^| findstr "mochiport-backend"') do (
        if "%%i" neq "" (
            set BACKEND_STATUS=Online
        ) else (
            set BACKEND_STATUS=Offline
        )
    )
    for /f "tokens=*" %%i in ('pm2 jlist ^| findstr "mochiport-frontend"') do (
        if "%%i" neq "" (
            set FRONTEND_STATUS=Online
        ) else (
            set FRONTEND_STATUS=Offline
        )
    )
) else (
    set BACKEND_STATUS=Unknown
    set FRONTEND_STATUS=Unknown
)

REM Get system load (simplified)
for /f "tokens=2 delims==" %%i in ('wmic cpu get loadpercentage /value ^| findstr "="') do set SYSTEM_LOAD=%%i%%
goto :eof

:EXIT
echo.
echo Thank you for using MochiPort Management Dashboard!
echo.
pause
exit /b 0
