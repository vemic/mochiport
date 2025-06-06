@echo off
REM Performance Check Batch Script
REM Runs a quick performance check and logs results

echo [%date% %time%] Starting performance check...

REM Check VS Code memory usage
echo Checking VS Code memory usage...
powershell -Command "Get-Process -Name 'Code' -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet -Sum | Select-Object @{Name='TotalMemoryMB';Expression={[math]::Round($_.Sum / 1MB, 2)}}, Count | Format-Table -AutoSize"

REM Check Node.js memory usage
echo Checking Node.js memory usage...
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet -Sum | Select-Object @{Name='TotalMemoryMB';Expression={[math]::Round($_.Sum / 1MB, 2)}}, Count | Format-Table -AutoSize"

REM Check system memory
echo Checking system memory...
powershell -Command "$mem = Get-WmiObject -Class Win32_OperatingSystem; $total = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2); $free = [math]::Round($mem.FreePhysicalMemory / 1MB, 2); $used = $total - $free; $percent = [math]::Round(($used / $total) * 100, 2); Write-Host \"Total: $total GB, Used: $used GB, Free: $free GB, Usage: $percent%\""

REM Check if any processes are using excessive memory (>2GB)
echo Checking for high memory processes...
powershell -Command "Get-Process | Where-Object {$_.WorkingSet -gt 2GB} | Select-Object ProcessName, @{Name='MemoryMB';Expression={[math]::Round($_.WorkingSet / 1MB, 2)}} | Sort-Object MemoryMB -Descending | Format-Table -AutoSize"

echo [%date% %time%] Performance check completed.
echo.
