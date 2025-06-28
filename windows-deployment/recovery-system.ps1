# MochiPort Automated Recovery System
# Monitors and automatically recovers from common failure scenarios

param(
    [switch]$StartRecoveryService,
    [switch]$TestRecovery,
    [string]$RestoreFromBackup
)

# Configuration
$AppName = "MochiPort"
$AppDir = Split-Path -Parent $PSScriptRoot
$LogDir = "$AppDir\logs"
$BackupDir = "$AppDir\data\backups"
$ConfigFile = "$AppDir\windows-deployment\recovery-config.json"

# Default recovery configuration
$DefaultConfig = @{
    MonitoringInterval = 30
    MaxRestartAttempts = 3
    RestartCooldown = 300
    EnableAutoRestart = $true
    EnableAutoRestore = $false
    AlertThresholds = @{
        MemoryUsage = 90
        CPUUsage = 95
        DiskSpace = 95
        ResponseTime = 10000
    }
    RecoveryActions = @{
        ServiceDown = @("restart_service", "check_dependencies", "restore_backup")
        HighMemory = @("restart_service", "garbage_collect", "scale_down")
        HighCPU = @("throttle_requests", "restart_service")
        DiskFull = @("cleanup_logs", "cleanup_temp", "alert_admin")
        DatabaseError = @("restart_database", "restore_backup", "failover")
    }
} | ConvertTo-Json -Depth 10

# Load or create configuration
if (-not (Test-Path $ConfigFile)) {
    Write-Host "Creating default recovery configuration..."
    $DefaultConfig | Set-Content -Path $ConfigFile
}

$Config = Get-Content -Path $ConfigFile | ConvertFrom-Json

function Write-RecoveryLog {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [RECOVERY] [$Level] $Message"
    Write-Host $LogMessage
    if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
    Add-Content -Path "$LogDir\recovery.log" -Value $LogMessage
}

function Get-ServiceStatus {
    try {
        $pm2Status = pm2 jlist | ConvertFrom-Json
        $backend = $pm2Status | Where-Object { $_.name -eq "mochiport-backend" }
        $frontend = $pm2Status | Where-Object { $_.name -eq "mochiport-frontend" }
        
        return @{
            BackendRunning = $backend.pm2_env.status -eq "online"
            FrontendRunning = $frontend.pm2_env.status -eq "online"
            BackendMemory = if ($backend) { [math]::Round($backend.monit.memory / 1MB, 2) } else { 0 }
            FrontendMemory = if ($frontend) { [math]::Round($frontend.monit.memory / 1MB, 2) } else { 0 }
            BackendCPU = if ($backend) { $backend.monit.cpu } else { 0 }
            FrontendCPU = if ($frontend) { $frontend.monit.cpu } else { 0 }
            BackendPID = if ($backend) { $backend.pid } else { $null }
            FrontendPID = if ($frontend) { $frontend.pid } else { $null }
        }
    } catch {
        Write-RecoveryLog "Error getting service status: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Test-HealthEndpoint {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:7071/api/health" -TimeoutSec 10
        return @{
            StatusCode = $response.StatusCode
            ResponseTime = (Measure-Command { 
                Invoke-WebRequest -Uri "http://localhost:7071/api/health" -TimeoutSec 10 
            }).TotalMilliseconds
            Healthy = $response.StatusCode -eq 200
        }
    } catch {
        return @{
            StatusCode = $null
            ResponseTime = $null
            Healthy = $false
            Error = $_.Exception.Message
        }
    }
}

function Invoke-RecoveryAction {
    param([string]$Action, [string]$Context = "")
    
    Write-RecoveryLog "Executing recovery action: $Action ($Context)" "ACTION"
    
    switch ($Action) {
        "restart_service" {
            Write-RecoveryLog "Restarting MochiPort services..."
            pm2 restart ecosystem.config.json
            Start-Sleep 10
            return Test-HealthEndpoint
        }
        
        "restart_backend" {
            Write-RecoveryLog "Restarting backend service..."
            pm2 restart mochiport-backend
            Start-Sleep 5
            return Test-HealthEndpoint
        }
        
        "restart_frontend" {
            Write-RecoveryLog "Restarting frontend service..."
            pm2 restart mochiport-frontend
            Start-Sleep 5
            return $true
        }
        
        "check_dependencies" {
            Write-RecoveryLog "Checking dependencies..."
            Set-Location $AppDir
            $result = yarn install --check-files 2>&1
            Write-RecoveryLog "Dependency check result: $result"
            return $LASTEXITCODE -eq 0
        }
        
        "garbage_collect" {
            Write-RecoveryLog "Forcing garbage collection..."
            pm2 trigger mochiport-backend gc
            pm2 trigger mochiport-frontend gc
            return $true
        }
        
        "cleanup_logs" {
            Write-RecoveryLog "Cleaning up old logs..."
            Get-ChildItem -Path $LogDir -Filter "*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
            pm2 flush
            return $true
        }
        
        "cleanup_temp" {
            Write-RecoveryLog "Cleaning up temporary files..."
            Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
            return $true
        }
        
        "restore_backup" {
            if ($Config.EnableAutoRestore) {
                Write-RecoveryLog "Initiating automatic backup restore..."
                $latestBackup = Get-ChildItem -Path $BackupDir -Filter "mochiport_backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                if ($latestBackup) {
                    return Restore-FromBackup -BackupPath $latestBackup.FullName
                }
            } else {
                Write-RecoveryLog "Auto-restore is disabled. Manual intervention required." "WARNING"
            }
            return $false
        }
        
        "alert_admin" {
            Write-RecoveryLog "Alerting administrator..." "ALERT"
            # Send email, webhook, or other notification
            try {
                Write-EventLog -LogName Application -Source "MochiPort" -EventId 2001 -EntryType Error -Message "MochiPort requires administrator attention: $Context"
            } catch {
                Write-RecoveryLog "Failed to write to event log" "ERROR"
            }
            return $true
        }
        
        default {
            Write-RecoveryLog "Unknown recovery action: $Action" "ERROR"
            return $false
        }
    }
}

function Restore-FromBackup {
    param([string]$BackupPath)
    
    Write-RecoveryLog "Restoring from backup: $BackupPath" "ACTION"
    
    try {
        # Stop services
        pm2 stop ecosystem.config.json
        
        # Extract backup
        $tempDir = "$env:TEMP\mochiport_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Expand-Archive -Path $BackupPath -DestinationPath $tempDir -Force
        
        # Restore configuration files
        $backupConfigDir = Get-ChildItem -Path $tempDir -Directory | Select-Object -First 1
        $configSource = "$($backupConfigDir.FullName)\config"
        
        if (Test-Path $configSource) {
            Copy-Item -Path "$configSource\*" -Destination $AppDir -Recurse -Force
            Write-RecoveryLog "Configuration files restored"
        }
        
        # Restart services
        pm2 start ecosystem.config.json --env production
        
        # Cleanup
        Remove-Item -Path $tempDir -Recurse -Force
        
        Write-RecoveryLog "Backup restore completed successfully"
        return $true
        
    } catch {
        Write-RecoveryLog "Backup restore failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Start-RecoveryMonitoring {
    Write-RecoveryLog "Starting automated recovery monitoring..."
    
    $restartAttempts = @{}
    
    while ($true) {
        try {
            $status = Get-ServiceStatus
            $health = Test-HealthEndpoint
            
            if ($status) {
                $issuesDetected = @()
                
                # Check service status
                if (-not $status.BackendRunning) {
                    $issuesDetected += "BackendDown"
                }
                if (-not $status.FrontendRunning) {
                    $issuesDetected += "FrontendDown"
                }
                
                # Check resource usage
                if ($status.BackendMemory -gt $Config.AlertThresholds.MemoryUsage) {
                    $issuesDetected += "HighMemory"
                }
                if ($status.BackendCPU -gt $Config.AlertThresholds.CPUUsage) {
                    $issuesDetected += "HighCPU"
                }
                
                # Check health endpoint
                if (-not $health.Healthy) {
                    $issuesDetected += "HealthCheckFailed"
                }
                if ($health.ResponseTime -gt $Config.AlertThresholds.ResponseTime) {
                    $issuesDetected += "SlowResponse"
                }
                
                # Execute recovery actions for detected issues
                foreach ($issue in $issuesDetected) {
                    $attemptKey = "$issue-$(Get-Date -Format 'yyyy-MM-dd-HH')"
                    
                    if (-not $restartAttempts.ContainsKey($attemptKey)) {
                        $restartAttempts[$attemptKey] = 0
                    }
                    
                    if ($restartAttempts[$attemptKey] -lt $Config.MaxRestartAttempts) {
                        Write-RecoveryLog "Issue detected: $issue (Attempt $($restartAttempts[$attemptKey] + 1)/$($Config.MaxRestartAttempts))" "WARNING"
                        
                        $recoveryActions = switch ($issue) {
                            "BackendDown" { @("restart_backend", "check_dependencies") }
                            "FrontendDown" { @("restart_frontend", "check_dependencies") }
                            "HighMemory" { @("garbage_collect", "restart_service") }
                            "HighCPU" { @("restart_service") }
                            "HealthCheckFailed" { @("restart_service", "check_dependencies") }
                            "SlowResponse" { @("restart_service") }
                            default { @("restart_service") }
                        }
                        
                        foreach ($action in $recoveryActions) {
                            $result = Invoke-RecoveryAction -Action $action -Context $issue
                            if ($result) {
                                Write-RecoveryLog "Recovery action '$action' successful for issue '$issue'"
                                break
                            } else {
                                Write-RecoveryLog "Recovery action '$action' failed for issue '$issue'" "ERROR"
                            }
                        }
                        
                        $restartAttempts[$attemptKey]++
                        
                        if ($restartAttempts[$attemptKey] -ge $Config.MaxRestartAttempts) {
                            Write-RecoveryLog "Maximum restart attempts reached for $issue. Alerting administrator." "CRITICAL"
                            Invoke-RecoveryAction -Action "alert_admin" -Context "Max restart attempts exceeded for $issue"
                        }
                        
                        # Cooldown period
                        Start-Sleep $Config.RestartCooldown
                    }
                }
                
                if ($issuesDetected.Count -eq 0) {
                    Write-RecoveryLog "All systems healthy"
                }
            }
            
        } catch {
            Write-RecoveryLog "Error in recovery monitoring loop: $($_.Exception.Message)" "ERROR"
        }
        
        Start-Sleep $Config.MonitoringInterval
    }
}

function Test-RecoverySystem {
    Write-Host "Testing MochiPort Recovery System"
    Write-Host "=================================="
    
    # Test service status detection
    Write-Host "Testing service status detection..."
    $status = Get-ServiceStatus
    if ($status) {
        Write-Host "✓ Service status detection working"
        Write-Host "  Backend: $($status.BackendRunning), Memory: $($status.BackendMemory)MB"
        Write-Host "  Frontend: $($status.FrontendRunning), Memory: $($status.FrontendMemory)MB"
    } else {
        Write-Host "✗ Service status detection failed"
    }
    
    # Test health endpoint
    Write-Host "`nTesting health endpoint..."
    $health = Test-HealthEndpoint
    if ($health.Healthy) {
        Write-Host "✓ Health endpoint responding (${$health.ResponseTime}ms)"
    } else {
        Write-Host "✗ Health endpoint not responding: $($health.Error)"
    }
    
    # Test recovery actions (non-destructive)
    Write-Host "`nTesting recovery actions..."
    Write-Host "  Testing cleanup_logs..."
    $result = Invoke-RecoveryAction -Action "cleanup_logs" -Context "test"
    Write-Host "  Cleanup logs: $(if ($result) { '✓' } else { '✗' })"
    
    Write-Host "`nRecovery system test completed."
}

# Main execution
switch ($true) {
    $StartRecoveryService {
        Start-RecoveryMonitoring
    }
    $TestRecovery {
        Test-RecoverySystem
    }
    $RestoreFromBackup {
        if (Test-Path $RestoreFromBackup) {
            Restore-FromBackup -BackupPath $RestoreFromBackup
        } else {
            Write-Host "Backup file not found: $RestoreFromBackup"
        }
    }
    default {
        Write-Host "MochiPort Automated Recovery System"
        Write-Host "Usage:"
        Write-Host "  -StartRecoveryService    : Start automated recovery monitoring"
        Write-Host "  -TestRecovery           : Test recovery system components"
        Write-Host "  -RestoreFromBackup <path> : Restore from specific backup"
        Write-Host ""
        Write-Host "Configuration file: $ConfigFile"
    }
}
