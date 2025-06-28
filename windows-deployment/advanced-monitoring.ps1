# MochiPort Windows Advanced Monitoring Script
# Monitors system health, application status, and performance metrics

param(
    [switch]$InstallAsService,
    [switch]$StartMonitoring,
    [int]$IntervalSeconds = 60
)

# Configuration
$AppName = "MochiPort"
$BackendUrl = "http://localhost:7071"
$FrontendUrl = "http://localhost:3000"
$HealthCheckUrl = "$BackendUrl/api/health"
$LogDir = ".\logs"
$AlertThresholds = @{
    CPU = 80
    Memory = 85
    DiskSpace = 90
    ResponseTime = 5000
}

# Create logs directory if it doesn't exist
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path "$LogDir\monitoring.log" -Value $LogMessage
}

function Test-ServiceHealth {
    try {
        # Check PM2 processes
        $pm2Status = pm2 jlist | ConvertFrom-Json
        $backendProcess = $pm2Status | Where-Object { $_.name -eq "mochiport-backend" }
        $frontendProcess = $pm2Status | Where-Object { $_.name -eq "mochiport-frontend" }
        
        $healthCheck = @{
            Timestamp = Get-Date
            BackendRunning = $backendProcess.pm2_env.status -eq "online"
            FrontendRunning = $frontendProcess.pm2_env.status -eq "online"
            BackendMemory = [math]::Round($backendProcess.monit.memory / 1MB, 2)
            FrontendMemory = [math]::Round($frontendProcess.monit.memory / 1MB, 2)
            BackendCPU = $backendProcess.monit.cpu
            FrontendCPU = $frontendProcess.monit.cpu
        }

        # HTTP Health Check
        try {
            $response = Invoke-WebRequest -Uri $HealthCheckUrl -TimeoutSec 10
            $healthCheck.HealthEndpointStatus = $response.StatusCode
            $healthCheck.ResponseTime = (Measure-Command { 
                Invoke-WebRequest -Uri $HealthCheckUrl -TimeoutSec 10 
            }).TotalMilliseconds
        } catch {
            $healthCheck.HealthEndpointStatus = "Error"
            $healthCheck.HealthEndpointError = $_.Exception.Message
        }

        # System Resources
        $cpu = Get-WmiObject Win32_PerfRawData_PerfOS_Processor | Where-Object {$_.Name -eq "_Total"}
        $memory = Get-WmiObject Win32_OperatingSystem
        $disk = Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DeviceID -eq "C:"}
        
        $healthCheck.SystemCPU = [math]::Round((($cpu.PercentProcessorTime / $cpu.Timestamp_Sys100NS) * 100), 2)
        $healthCheck.SystemMemoryUsed = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
        $healthCheck.DiskUsed = [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 2)

        return $healthCheck
    } catch {
        Write-Log "Error during health check: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Send-Alert {
    param([string]$Message, [string]$Severity = "WARNING")
    
    Write-Log "ALERT [$Severity]: $Message" "ALERT"
    
    # Windows Event Log
    try {
        Write-EventLog -LogName Application -Source "MochiPort" -EventId 1001 -EntryType Warning -Message $Message
    } catch {
        # Create event source if it doesn't exist
        try {
            New-EventLog -LogName Application -Source "MochiPort"
            Write-EventLog -LogName Application -Source "MochiPort" -EventId 1001 -EntryType Warning -Message $Message
        } catch {
            Write-Log "Failed to write to Windows Event Log" "ERROR"
        }
    }
    
    # Could add email/webhook notifications here
    # Send-MailMessage or Invoke-WebRequest for Slack/Teams notifications
}

function Start-Monitoring {
    Write-Log "Starting MochiPort monitoring service..."
    
    while ($true) {
        $health = Test-ServiceHealth
        
        if ($health) {
            # Check for alerts
            if (-not $health.BackendRunning) {
                Send-Alert "Backend service is not running" "CRITICAL"
                # Attempt restart
                Write-Log "Attempting to restart backend service..."
                pm2 restart mochiport-backend
            }
            
            if (-not $health.FrontendRunning) {
                Send-Alert "Frontend service is not running" "CRITICAL"
                Write-Log "Attempting to restart frontend service..."
                pm2 restart mochiport-frontend
            }
            
            if ($health.SystemCPU -gt $AlertThresholds.CPU) {
                Send-Alert "High CPU usage: $($health.SystemCPU)%" "WARNING"
            }
            
            if ($health.SystemMemoryUsed -gt $AlertThresholds.Memory) {
                Send-Alert "High memory usage: $($health.SystemMemoryUsed)%" "WARNING"
            }
            
            if ($health.DiskUsed -gt $AlertThresholds.DiskSpace) {
                Send-Alert "Low disk space: $($health.DiskUsed)% used" "WARNING"
            }
            
            if ($health.ResponseTime -gt $AlertThresholds.ResponseTime) {
                Send-Alert "Slow response time: $($health.ResponseTime)ms" "WARNING"
            }
            
            # Log health status
            $healthJson = $health | ConvertTo-Json -Compress
            Add-Content -Path "$LogDir\health-check.log" -Value $healthJson
            
            Write-Log "Health check completed - Backend: $($health.BackendRunning), Frontend: $($health.FrontendRunning), CPU: $($health.SystemCPU)%, Memory: $($health.SystemMemoryUsed)%"
        }
        
        Start-Sleep $IntervalSeconds
    }
}

function Install-MonitoringService {
    Write-Log "Installing monitoring as Windows service..."
    
    # Create a service script
    $serviceScript = @"
# MochiPort Monitoring Service
Add-Type -AssemblyName System.ServiceProcess
`$servicePath = '$PSScriptRoot\mochiport-monitoring.ps1'
powershell.exe -ExecutionPolicy Bypass -File `$servicePath -StartMonitoring
"@
    
    Set-Content -Path ".\mochiport-monitoring-service.ps1" -Value $serviceScript
    
    # Register as Windows service using nssm or srvany
    Write-Log "Please install NSSM (Non-Sucking Service Manager) to complete service installation"
    Write-Log "Download from: https://nssm.cc/download"
    Write-Log "Then run: nssm install MochiPortMonitoring powershell.exe"
    Write-Log "Set parameters: -ExecutionPolicy Bypass -File `"$PWD\mochiport-monitoring.ps1`" -StartMonitoring"
}

# Main execution
switch ($true) {
    $InstallAsService {
        Install-MonitoringService
    }
    $StartMonitoring {
        Start-Monitoring
    }
    default {
        Write-Host "MochiPort Advanced Monitoring"
        Write-Host "Usage:"
        Write-Host "  -StartMonitoring      : Start monitoring loop"
        Write-Host "  -InstallAsService     : Install as Windows service"
        Write-Host "  -IntervalSeconds <n>  : Monitoring interval (default: 60)"
        Write-Host ""
        Write-Host "Example: .\advanced-monitoring.ps1 -StartMonitoring -IntervalSeconds 30"
    }
}
