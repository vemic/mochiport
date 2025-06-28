# Windows Service Configuration for MochiPort
# Use with node-windows or pm2-windows-service

$serviceName = "MochiPort"
$serviceDisplayName = "MochiPort AI Chat Application"
$serviceDescription = "AI Chat Management Application with Express backend and Next.js frontend"
$executablePath = "C:\Program Files\nodejs\node.exe"
$scriptPath = (Get-Location).Path + "\backend\dist\server.js"
$workingDirectory = (Get-Location).Path

Write-Host "MochiPort Windows Service Configuration"
Write-Host "====================================="
Write-Host "Service Name: $serviceName"
Write-Host "Executable: $executablePath"
Write-Host "Script: $scriptPath"
Write-Host "Working Directory: $workingDirectory"
Write-Host ""

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install node-windows if not already installed
try {
    npm list -g node-windows | Out-Null
} catch {
    Write-Host "Installing node-windows..."
    npm install -g node-windows
}

# Service installation script (to be run manually)
Write-Host @"

To install MochiPort as a Windows Service:

1. Install node-windows globally:
   npm install -g node-windows

2. Create service-install.js:
   
   var Service = require('node-windows').Service;
   
   var svc = new Service({
     name: '$serviceName',
     description: '$serviceDescription',
     script: '$scriptPath',
     workingDirectory: '$workingDirectory',
     env: {
       name: 'NODE_ENV',
       value: 'production'
     }
   });
   
   svc.on('install', function(){
     svc.start();
   });
   
   svc.install();

3. Run: node service-install.js

To uninstall:
1. Create service-uninstall.js with svc.uninstall();
2. Run: node service-uninstall.js

"@

Read-Host "Press Enter to continue"
