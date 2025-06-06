# Performance Monitor Script for VS Code and Node.js processes
# Monitors memory usage and provides alerts when thresholds are exceeded

param(
    [int]$IntervalSeconds = 60,
    [int]$VSCodeMemoryThresholdMB = 8000,
    [int]$NodeMemoryThresholdMB = 4000,
    [string]$LogFile = "performance-monitor.log"
)

function Write-LogEntry {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

function Get-VSCodeMemoryUsage {
    $vsCodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue
    if ($vsCodeProcesses) {
        $totalMemory = ($vsCodeProcesses | Measure-Object -Property WorkingSet -Sum).Sum
        $memoryMB = [math]::Round($totalMemory / 1MB, 2)
        $processCount = $vsCodeProcesses.Count
        return @{
            TotalMemoryMB = $memoryMB
            ProcessCount = $processCount
            Processes = $vsCodeProcesses
        }
    }
    return $null
}

function Get-NodeMemoryUsage {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $totalMemory = ($nodeProcesses | Measure-Object -Property WorkingSet -Sum).Sum
        $memoryMB = [math]::Round($totalMemory / 1MB, 2)
        $processCount = $nodeProcesses.Count
        return @{
            TotalMemoryMB = $memoryMB
            ProcessCount = $processCount
            Processes = $nodeProcesses
        }
    }
    return $null
}

function Send-Alert {
    param([string]$AlertMessage)
    Write-LogEntry "ALERT: $AlertMessage"
    # Here you could add email notifications, Slack webhooks, etc.
    # For now, we'll just log to console and file
    Write-Host "🚨 PERFORMANCE ALERT: $AlertMessage" -ForegroundColor Red
}

function Start-PerformanceMonitoring {
    Write-LogEntry "Performance monitoring started"
    Write-LogEntry "VS Code memory threshold: $VSCodeMemoryThresholdMB MB"
    Write-LogEntry "Node.js memory threshold: $NodeMemoryThresholdMB MB"
    Write-LogEntry "Check interval: $IntervalSeconds seconds"
    
    while ($true) {
        try {
            # Check VS Code memory usage
            $vsCodeStats = Get-VSCodeMemoryUsage
            if ($vsCodeStats) {
                $vsCodeMemory = $vsCodeStats.TotalMemoryMB
                $vsCodeCount = $vsCodeStats.ProcessCount
                
                if ($vsCodeMemory -gt $VSCodeMemoryThresholdMB) {
                    Send-Alert "VS Code memory usage exceeded threshold: $vsCodeMemory MB (Processes: $vsCodeCount)"
                } else {
                    Write-LogEntry "VS Code: $vsCodeMemory MB ($vsCodeCount processes) - OK"
                }
            } else {
                Write-LogEntry "VS Code: Not running"
            }
            
            # Check Node.js memory usage
            $nodeStats = Get-NodeMemoryUsage
            if ($nodeStats) {
                $nodeMemory = $nodeStats.TotalMemoryMB
                $nodeCount = $nodeStats.ProcessCount
                
                if ($nodeMemory -gt $NodeMemoryThresholdMB) {
                    Send-Alert "Node.js memory usage exceeded threshold: $nodeMemory MB (Processes: $nodeCount)"
                } else {
                    Write-LogEntry "Node.js: $nodeMemory MB ($nodeCount processes) - OK"
                }
            } else {
                Write-LogEntry "Node.js: No processes found"
            }
            
            # System memory check
            $systemMemory = Get-WmiObject -Class Win32_OperatingSystem
            $totalMemoryGB = [math]::Round($systemMemory.TotalVisibleMemorySize / 1MB, 2)
            $freeMemoryGB = [math]::Round($systemMemory.FreePhysicalMemory / 1MB, 2)
            $usedMemoryGB = $totalMemoryGB - $freeMemoryGB
            $memoryUsagePercent = [math]::Round(($usedMemoryGB / $totalMemoryGB) * 100, 2)
            
            if ($memoryUsagePercent -gt 90) {
                Send-Alert "System memory usage critical: $memoryUsagePercent% ($usedMemoryGB GB / $totalMemoryGB GB)"
            } elseif ($memoryUsagePercent -gt 80) {
                Write-LogEntry "System memory usage high: $memoryUsagePercent% ($usedMemoryGB GB / $totalMemoryGB GB)"
            } else {
                Write-LogEntry "System memory: $memoryUsagePercent% ($usedMemoryGB GB / $totalMemoryGB GB) - OK"
            }
            
            Write-LogEntry "--- Check completed ---"
            
        } catch {
            Write-LogEntry "Error during monitoring: $($_.Exception.Message)"
        }
        
        Start-Sleep -Seconds $IntervalSeconds
    }
}

# Show current status before starting monitoring
Write-Host "Current Performance Status:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

$vsCodeCurrent = Get-VSCodeMemoryUsage
if ($vsCodeCurrent) {
    Write-Host "VS Code: $($vsCodeCurrent.TotalMemoryMB) MB ($($vsCodeCurrent.ProcessCount) processes)" -ForegroundColor Cyan
} else {
    Write-Host "VS Code: Not running" -ForegroundColor Yellow
}

$nodeCurrent = Get-NodeMemoryUsage
if ($nodeCurrent) {
    Write-Host "Node.js: $($nodeCurrent.TotalMemoryMB) MB ($($nodeCurrent.ProcessCount) processes)" -ForegroundColor Cyan
} else {
    Write-Host "Node.js: No processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting continuous monitoring..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start monitoring
Start-PerformanceMonitoring
