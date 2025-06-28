@echo off
REM MochiPort Windows Deployment Integration Test
REM Tests all components of the Windows standalone deployment

echo ========================================
echo MochiPort Windows Deployment Test Suite
echo ========================================
echo Start Time: %date% %time%
echo.

set "ERRORS=0"
set "WARNINGS=0"
set "TEST_RESULTS_FILE=test-results-%date:~10,4%%date:~4,2%%date:~7,2%.log"

REM Initialize test results file
echo MochiPort Windows Deployment Test Results > "%TEST_RESULTS_FILE%"
echo Start Time: %date% %time% >> "%TEST_RESULTS_FILE%"
echo ============================================ >> "%TEST_RESULTS_FILE%"
echo. >> "%TEST_RESULTS_FILE%"

call :TEST_SECTION "Prerequisites Check"
call :TEST_PREREQUISITES

call :TEST_SECTION "Application Build Test"
call :TEST_BUILD

call :TEST_SECTION "Service Management Test"
call :TEST_SERVICES

call :TEST_SECTION "Health Check Test"
call :TEST_HEALTH

call :TEST_SECTION "Security Configuration Test"
call :TEST_SECURITY

call :TEST_SECTION "Backup System Test"
call :TEST_BACKUP

call :TEST_SECTION "Monitoring System Test"
call :TEST_MONITORING

call :TEST_SECTION "Performance Test"
call :TEST_PERFORMANCE

call :FINAL_REPORT
goto :EOF

:TEST_SECTION
echo.
echo ========================================
echo %~1
echo ========================================
echo %~1 >> "%TEST_RESULTS_FILE%"
echo ---------------------------------------- >> "%TEST_RESULTS_FILE%"
goto :EOF

:TEST_PREREQUISITES
echo Testing prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1" %%v in ('node --version') do (
        echo ✓ Node.js version: %%v
        echo [PASS] Node.js version: %%v >> "%TEST_RESULTS_FILE%"
    )
) else (
    echo ✗ Node.js not found
    echo [FAIL] Node.js not found >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check Yarn
yarn --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1" %%v in ('yarn --version') do (
        echo ✓ Yarn version: %%v
        echo [PASS] Yarn version: %%v >> "%TEST_RESULTS_FILE%"
    )
) else (
    echo ✗ Yarn not found
    echo [FAIL] Yarn not found >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check PM2
pm2 --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1" %%v in ('pm2 --version') do (
        echo ✓ PM2 version: %%v
        echo [PASS] PM2 version: %%v >> "%TEST_RESULTS_FILE%"
    )
) else (
    echo ✗ PM2 not found
    echo [FAIL] PM2 not found >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check PowerShell
powershell -Command "Write-Host 'PowerShell available'" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PowerShell available
    echo [PASS] PowerShell available >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ PowerShell not available
    echo [FAIL] PowerShell not available >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check required directories
if exist "backend" (
    echo ✓ Backend directory exists
    echo [PASS] Backend directory exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Backend directory missing
    echo [FAIL] Backend directory missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

if exist "frontend" (
    echo ✓ Frontend directory exists
    echo [PASS] Frontend directory exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Frontend directory missing
    echo [FAIL] Frontend directory missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

if exist "ecosystem.config.json" (
    echo ✓ PM2 configuration exists
    echo [PASS] PM2 configuration exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ PM2 configuration missing
    echo [FAIL] PM2 configuration missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

goto :EOF

:TEST_BUILD
echo Testing application build...

REM Install dependencies
echo Installing dependencies...
call yarn install --frozen-lockfile >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Dependencies installed successfully
    echo [PASS] Dependencies installed successfully >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Dependency installation failed
    echo [FAIL] Dependency installation failed >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Build application
echo Building application...
call yarn build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Application built successfully
    echo [PASS] Application built successfully >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Application build failed
    echo [FAIL] Application build failed >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check build outputs
if exist "backend\dist\server.js" (
    echo ✓ Backend build output exists
    echo [PASS] Backend build output exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Backend build output missing
    echo [FAIL] Backend build output missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

if exist "frontend\.next" (
    echo ✓ Frontend build output exists
    echo [PASS] Frontend build output exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Frontend build output missing
    echo [FAIL] Frontend build output missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

goto :EOF

:TEST_SERVICES
echo Testing service management...

REM Stop any existing services
echo Stopping existing services...
pm2 stop ecosystem.config.json >nul 2>&1
pm2 delete ecosystem.config.json >nul 2>&1

REM Start services
echo Starting services...
pm2 start ecosystem.config.json --env production >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Services started successfully
    echo [PASS] Services started successfully >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Failed to start services
    echo [FAIL] Failed to start services >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
    goto :EOF
)

REM Wait for services to initialize
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul

REM Check service status
pm2 jlist >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PM2 is responsive
    echo [PASS] PM2 is responsive >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ PM2 is not responsive
    echo [FAIL] PM2 is not responsive >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check individual processes
for /f "tokens=*" %%i in ('pm2 jlist ^| findstr "mochiport-backend"') do (
    if "%%i" neq "" (
        echo ✓ Backend process running
        echo [PASS] Backend process running >> "%TEST_RESULTS_FILE%"
    ) else (
        echo ✗ Backend process not running
        echo [FAIL] Backend process not running >> "%TEST_RESULTS_FILE%"
        set /a ERRORS+=1
    )
)

for /f "tokens=*" %%i in ('pm2 jlist ^| findstr "mochiport-frontend"') do (
    if "%%i" neq "" (
        echo ✓ Frontend process running
        echo [PASS] Frontend process running >> "%TEST_RESULTS_FILE%"
    ) else (
        echo ✗ Frontend process not running
        echo [FAIL] Frontend process not running >> "%TEST_RESULTS_FILE%"
        set /a ERRORS+=1
    )
)

goto :EOF

:TEST_HEALTH
echo Testing health endpoints...

REM Wait for services to be fully ready
timeout /t 15 /nobreak >nul

REM Test backend health endpoint
echo Testing backend health...
curl -s -o nul -w "%%{http_code}" http://localhost:7071/api/health > temp_http_code.txt 2>nul
set /p HTTP_CODE=<temp_http_code.txt
del temp_http_code.txt >nul 2>&1

if "%HTTP_CODE%"=="200" (
    echo ✓ Backend health endpoint responding (HTTP %HTTP_CODE%)
    echo [PASS] Backend health endpoint responding (HTTP %HTTP_CODE%) >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Backend health endpoint not responding (HTTP %HTTP_CODE%)
    echo [FAIL] Backend health endpoint not responding (HTTP %HTTP_CODE%) >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Test frontend endpoint
echo Testing frontend...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > temp_http_code.txt 2>nul
set /p HTTP_CODE=<temp_http_code.txt
del temp_http_code.txt >nul 2>&1

if "%HTTP_CODE%"=="200" (
    echo ✓ Frontend endpoint responding (HTTP %HTTP_CODE%)
    echo [PASS] Frontend endpoint responding (HTTP %HTTP_CODE%) >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Frontend endpoint not responding (HTTP %HTTP_CODE%)
    echo [FAIL] Frontend endpoint not responding (HTTP %HTTP_CODE%) >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Test port availability
netstat -an | findstr ":7071" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend port 7071 is listening
    echo [PASS] Backend port 7071 is listening >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Backend port 7071 is not listening
    echo [FAIL] Backend port 7071 is not listening >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend port 3000 is listening
    echo [PASS] Frontend port 3000 is listening >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Frontend port 3000 is not listening
    echo [FAIL] Frontend port 3000 is not listening >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

goto :EOF

:TEST_SECURITY
echo Testing security configuration...

REM Check if security scripts exist
if exist "windows-deployment\security-config.ps1" (
    echo ✓ Security configuration script exists
    echo [PASS] Security configuration script exists >> "%TEST_RESULTS_FILE%"
    
    REM Run security audit
    echo Running security audit...
    powershell -ExecutionPolicy Bypass -Command ".\windows-deployment\security-config.ps1 -AuditSecurity" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Security audit completed
        echo [PASS] Security audit completed >> "%TEST_RESULTS_FILE%"
    ) else (
        echo ! Security audit had warnings
        echo [WARN] Security audit had warnings >> "%TEST_RESULTS_FILE%"
        set /a WARNINGS+=1
    )
) else (
    echo ✗ Security configuration script missing
    echo [FAIL] Security configuration script missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check firewall rules
netsh advfirewall firewall show rule name="MochiPort Backend" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend firewall rule exists
    echo [PASS] Backend firewall rule exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ! Backend firewall rule missing
    echo [WARN] Backend firewall rule missing >> "%TEST_RESULTS_FILE%"
    set /a WARNINGS+=1
)

REM Check SSL directory
if exist "ssl" (
    echo ✓ SSL directory exists
    echo [PASS] SSL directory exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ! SSL directory missing
    echo [WARN] SSL directory missing >> "%TEST_RESULTS_FILE%"
    set /a WARNINGS+=1
)

goto :EOF

:TEST_BACKUP
echo Testing backup system...

if exist "windows-deployment\backup-system.bat" (
    echo ✓ Backup script exists
    echo [PASS] Backup script exists >> "%TEST_RESULTS_FILE%"
    
    REM Create test backup
    echo Creating test backup...
    call "windows-deployment\backup-system.bat" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Backup creation successful
        echo [PASS] Backup creation successful >> "%TEST_RESULTS_FILE%"
        
        REM Check if backup file was created
        dir /B "data\backups\mochiport_backup_*" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✓ Backup file created
            echo [PASS] Backup file created >> "%TEST_RESULTS_FILE%"
        ) else (
            echo ✗ Backup file not found
            echo [FAIL] Backup file not found >> "%TEST_RESULTS_FILE%"
            set /a ERRORS+=1
        )
    ) else (
        echo ✗ Backup creation failed
        echo [FAIL] Backup creation failed >> "%TEST_RESULTS_FILE%"
        set /a ERRORS+=1
    )
) else (
    echo ✗ Backup script missing
    echo [FAIL] Backup script missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

goto :EOF

:TEST_MONITORING
echo Testing monitoring system...

if exist "windows-deployment\advanced-monitoring.ps1" (
    echo ✓ Advanced monitoring script exists
    echo [PASS] Advanced monitoring script exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ✗ Advanced monitoring script missing
    echo [FAIL] Advanced monitoring script missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

if exist "windows-deployment\recovery-system.ps1" (
    echo ✓ Recovery system script exists
    echo [PASS] Recovery system script exists >> "%TEST_RESULTS_FILE%"
    
    REM Test recovery system
    echo Testing recovery system...
    powershell -ExecutionPolicy Bypass -Command ".\windows-deployment\recovery-system.ps1 -TestRecovery" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Recovery system test passed
        echo [PASS] Recovery system test passed >> "%TEST_RESULTS_FILE%"
    ) else (
        echo ! Recovery system test had issues
        echo [WARN] Recovery system test had issues >> "%TEST_RESULTS_FILE%"
        set /a WARNINGS+=1
    )
) else (
    echo ✗ Recovery system script missing
    echo [FAIL] Recovery system script missing >> "%TEST_RESULTS_FILE%"
    set /a ERRORS+=1
)

REM Check log directory
if exist "logs" (
    echo ✓ Logs directory exists
    echo [PASS] Logs directory exists >> "%TEST_RESULTS_FILE%"
) else (
    echo ! Logs directory missing
    echo [WARN] Logs directory missing >> "%TEST_RESULTS_FILE%"
    set /a WARNINGS+=1
)

goto :EOF

:TEST_PERFORMANCE
echo Testing performance...

REM Check memory usage
echo Checking memory usage...
powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Measure-Object WorkingSet64 -Sum | Select-Object @{Name='TotalMemoryMB';Expression={[math]::Round($_.Sum/1MB,2)}}" > temp_memory.txt 2>nul

for /f "skip=3 tokens=1" %%m in (temp_memory.txt) do (
    set "MEMORY_USAGE=%%m"
)
del temp_memory.txt >nul 2>&1

if defined MEMORY_USAGE (
    echo ✓ Total Node.js memory usage: %MEMORY_USAGE%MB
    echo [PASS] Total Node.js memory usage: %MEMORY_USAGE%MB >> "%TEST_RESULTS_FILE%"
    
    REM Check if memory usage is reasonable (less than 2GB)
    powershell -Command "if ([float]'%MEMORY_USAGE%' -lt 2048) { exit 0 } else { exit 1 }" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Memory usage is within acceptable range
        echo [PASS] Memory usage is within acceptable range >> "%TEST_RESULTS_FILE%"
    ) else (
        echo ! High memory usage detected
        echo [WARN] High memory usage detected >> "%TEST_RESULTS_FILE%"
        set /a WARNINGS+=1
    )
) else (
    echo ! Could not determine memory usage
    echo [WARN] Could not determine memory usage >> "%TEST_RESULTS_FILE%"
    set /a WARNINGS+=1
)

REM Basic load test (if autocannon is available)
npx autocannon --help >nul 2>&1
if %errorlevel% equ 0 (
    echo Running basic load test...
    npx autocannon http://localhost:7071/api/health -d 5 -c 5 --json > load_test_result.json 2>nul
    if %errorlevel% equ 0 (
        echo ✓ Load test completed
        echo [PASS] Load test completed >> "%TEST_RESULTS_FILE%"
        del load_test_result.json >nul 2>&1
    ) else (
        echo ! Load test failed
        echo [WARN] Load test failed >> "%TEST_RESULTS_FILE%"
        set /a WARNINGS+=1
    )
) else (
    echo ! Autocannon not available for load testing
    echo [INFO] Autocannon not available for load testing >> "%TEST_RESULTS_FILE%"
)

goto :EOF

:FINAL_REPORT
echo.
echo ========================================
echo Final Test Report
echo ========================================
echo End Time: %date% %time%
echo.

echo Summary: >> "%TEST_RESULTS_FILE%"
echo ======== >> "%TEST_RESULTS_FILE%"
echo End Time: %date% %time% >> "%TEST_RESULTS_FILE%"
echo Errors: %ERRORS% >> "%TEST_RESULTS_FILE%"
echo Warnings: %WARNINGS% >> "%TEST_RESULTS_FILE%"
echo. >> "%TEST_RESULTS_FILE%"

if %ERRORS% equ 0 (
    if %WARNINGS% equ 0 (
        echo ✓ ALL TESTS PASSED!
        echo Result: ALL TESTS PASSED >> "%TEST_RESULTS_FILE%"
        echo.
        echo The MochiPort Windows deployment is ready for production use.
        echo Recommendation: DEPLOY >> "%TEST_RESULTS_FILE%"
    ) else (
        echo ! TESTS PASSED WITH WARNINGS
        echo Result: TESTS PASSED WITH %WARNINGS% WARNINGS >> "%TEST_RESULTS_FILE%"
        echo.
        echo The deployment is functional but has %WARNINGS% warning(s).
        echo Please review the warnings before deploying to production.
        echo Recommendation: REVIEW WARNINGS BEFORE DEPLOY >> "%TEST_RESULTS_FILE%"
    )
) else (
    echo ✗ TESTS FAILED
    echo Result: TESTS FAILED WITH %ERRORS% ERRORS >> "%TEST_RESULTS_FILE%"
    echo.
    echo The deployment has %ERRORS% error(s) that must be fixed before production use.
    if %WARNINGS% gtr 0 (
        echo Additionally, there are %WARNINGS% warning(s) to review.
    )
    echo Recommendation: FIX ERRORS BEFORE DEPLOY >> "%TEST_RESULTS_FILE%"
)

echo.
echo Test results saved to: %TEST_RESULTS_FILE%
echo.

REM Clean up test processes
echo Cleaning up test processes...
pm2 stop ecosystem.config.json >nul 2>&1

echo.
echo Test suite completed.
pause

goto :EOF
