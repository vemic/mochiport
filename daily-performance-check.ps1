# Daily Performance Check Script
# Runs daily performance checks and logs results
# Schedule this to run daily via Windows Task Scheduler

param(
    [string]$LogDirectory = ".\performance-logs",
    [int]$RetentionDays = 30
)

# Create log directory if it doesn't exist
if (!(Test-Path $LogDirectory)) {
    New-Item -ItemType Directory -Path $LogDirectory -Force
}

$Date = Get-Date -Format "yyyy-MM-dd"
$Time = Get-Date -Format "HH:mm:ss"
$LogFile = "$LogDirectory\performance-$Date.log"

function Write-PerformanceLog {
    param([string]$Message)
    $LogEntry = "$Time - $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    Write-Host $LogEntry
}

Write-PerformanceLog "=== Daily Performance Check Started ==="

# Check VS Code Memory
try {
    $vsCodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue
    if ($vsCodeProcesses) {
        $totalMemoryMB = [math]::Round(($vsCodeProcesses | Measure-Object -Property WorkingSet -Sum).Sum / 1MB, 2)
        $processCount = $vsCodeProcesses.Count
        $maxProcessMB = [math]::Round(($vsCodeProcesses | Measure-Object -Property WorkingSet -Maximum).Maximum / 1MB, 2)
        
        Write-PerformanceLog "VS Code: Total $totalMemoryMB MB, Processes: $processCount, Max Process: $maxProcessMB MB"
        
        if ($totalMemoryMB -gt 8000) {
            Write-PerformanceLog "WARNING: VS Code memory usage is high ($totalMemoryMB MB)"
        } elseif ($totalMemoryMB -gt 6000) {
            Write-PerformanceLog "NOTICE: VS Code memory usage is elevated ($totalMemoryMB MB)"
        } else {
            Write-PerformanceLog "STATUS: VS Code memory usage is normal"
        }
    } else {
        Write-PerformanceLog "VS Code: Not running"
    }
} catch {
    Write-PerformanceLog "ERROR: Failed to check VS Code processes - $($_.Exception.Message)"
}

# Check Node.js Memory
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $totalMemoryMB = [math]::Round(($nodeProcesses | Measure-Object -Property WorkingSet -Sum).Sum / 1MB, 2)
        $processCount = $nodeProcesses.Count
        $maxProcessMB = [math]::Round(($nodeProcesses | Measure-Object -Property WorkingSet -Maximum).Maximum / 1MB, 2)
        
        Write-PerformanceLog "Node.js: Total $totalMemoryMB MB, Processes: $processCount, Max Process: $maxProcessMB MB"
        
        if ($totalMemoryMB -gt 4000) {
            Write-PerformanceLog "WARNING: Node.js memory usage is high ($totalMemoryMB MB)"
        } elseif ($totalMemoryMB -gt 2000) {
            Write-PerformanceLog "NOTICE: Node.js memory usage is elevated ($totalMemoryMB MB)"
        } else {
            Write-PerformanceLog "STATUS: Node.js memory usage is normal"
        }
    } else {
        Write-PerformanceLog "Node.js: No processes found"
    }
} catch {
    Write-PerformanceLog "ERROR: Failed to check Node.js processes - $($_.Exception.Message)"
}

# Check System Memory
try {
    $systemMemory = Get-WmiObject -Class Win32_OperatingSystem
    $totalGB = [math]::Round($systemMemory.TotalVisibleMemorySize / 1MB, 2)
    $freeGB = [math]::Round($systemMemory.FreePhysicalMemory / 1MB, 2)
    $usedGB = $totalGB - $freeGB
    $usagePercent = [math]::Round(($usedGB / $totalGB) * 100, 2)
    
    Write-PerformanceLog "System Memory: $usagePercent% ($usedGB GB / $totalGB GB)"
    
    if ($usagePercent -gt 90) {
        Write-PerformanceLog "CRITICAL: System memory usage is critical ($usagePercent%)"
    } elseif ($usagePercent -gt 80) {
        Write-PerformanceLog "WARNING: System memory usage is high ($usagePercent%)"
    } elseif ($usagePercent -gt 70) {
        Write-PerformanceLog "NOTICE: System memory usage is elevated ($usagePercent%)"
    } else {
        Write-PerformanceLog "STATUS: System memory usage is normal"
    }
} catch {
    Write-PerformanceLog "ERROR: Failed to check system memory - $($_.Exception.Message)"
}

# Check for high memory processes
try {
    $highMemoryProcesses = Get-Process | Where-Object {$_.WorkingSet -gt 1GB} | 
                          Select-Object ProcessName, @{Name='MemoryGB';Expression={[math]::Round($_.WorkingSet / 1GB, 2)}} | 
                          Sort-Object MemoryGB -Descending | 
                          Select-Object -First 5
    
    if ($highMemoryProcesses) {
        Write-PerformanceLog "High Memory Processes (>1GB):"
        foreach ($process in $highMemoryProcesses) {
            Write-PerformanceLog "  - $($process.ProcessName): $($process.MemoryGB) GB"
        }
    } else {
        Write-PerformanceLog "No processes using more than 1GB of memory"
    }
} catch {
    Write-PerformanceLog "ERROR: Failed to check high memory processes - $($_.Exception.Message)"
}

Write-PerformanceLog "=== Daily Performance Check Completed ==="

# Clean up old log files
try {
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem -Path $LogDirectory -Filter "performance-*.log" | 
    Where-Object {$_.CreationTime -lt $cutoffDate} | 
    Remove-Item -Force
    
    Write-PerformanceLog "Log cleanup completed (retention: $RetentionDays days)"
} catch {
    Write-PerformanceLog "ERROR: Failed to clean up old logs - $($_.Exception.Message)"
}

# Generate weekly summary (on Sundays)
if ((Get-Date).DayOfWeek -eq 'Sunday') {
    try {
        $weeklyLogs = Get-ChildItem -Path $LogDirectory -Filter "performance-*.log" | 
                     Where-Object {$_.CreationTime -gt (Get-Date).AddDays(-7)}
        
        if ($weeklyLogs) {
            $summaryFile = "$LogDirectory\weekly-summary-$Date.log"
            Add-Content -Path $summaryFile -Value "=== Weekly Performance Summary - $Date ==="
            Add-Content -Path $summaryFile -Value "Logs analyzed: $($weeklyLogs.Count) files"
            Add-Content -Path $summaryFile -Value ""
            
            # Count warnings and errors
            $warningCount = 0
            $errorCount = 0
            
            foreach ($log in $weeklyLogs) {
                $content = Get-Content $log.FullName
                $warningCount += ($content | Where-Object {$_ -match "WARNING"}).Count
                $errorCount += ($content | Where-Object {$_ -match "ERROR|CRITICAL"}).Count
            }
            
            Add-Content -Path $summaryFile -Value "Total Warnings: $warningCount"
            Add-Content -Path $summaryFile -Value "Total Errors: $errorCount"
            
            if ($warningCount -eq 0 -and $errorCount -eq 0) {
                Add-Content -Path $summaryFile -Value "Status: All systems operating normally"
            } elseif ($errorCount -eq 0) {
                Add-Content -Path $summaryFile -Value "Status: Minor issues detected, monitoring recommended"
            } else {
                Add-Content -Path $summaryFile -Value "Status: Issues detected, review recommended"
            }
            
            Write-PerformanceLog "Weekly summary generated: $summaryFile"
        }
    } catch {
        Write-PerformanceLog "ERROR: Failed to generate weekly summary - $($_.Exception.Message)"
    }
}
