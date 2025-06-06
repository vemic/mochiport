@echo off
REM Automated Daily Performance Check
REM This script is designed to be run by Windows Task Scheduler

cd /d "c:\dev\pj\vemi\mochiport"

echo [%date% %time%] Starting automated daily performance check...

REM Run the PowerShell performance check script
powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File ".\daily-performance-check.ps1"

echo [%date% %time%] Automated performance check completed.

REM Optional: Send notification (uncomment if needed)
REM powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Daily performance check completed successfully.', 'Performance Monitor', 'OK', 'Information')"
