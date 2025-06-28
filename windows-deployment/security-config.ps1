# MochiPort Windows Security Configuration
# Implements security best practices for standalone Windows deployment

param(
    [switch]$Configure,
    [switch]$AuditSecurity,
    [switch]$SetupHTTPS,
    [switch]$EnableFirewall,
    [switch]$ConfigureAuthentication
)

$AppDir = Split-Path -Parent $PSScriptRoot
$SecurityConfig = @{
    EnableHTTPS = $true
    RequireAuthentication = $true
    EnableFirewall = $true
    EnableEventLogging = $true
    DataEncryption = $true
    SecureHeaders = $true
    RateLimiting = $true
    IPWhitelist = @()
    SSLCertPath = "$AppDir\ssl"
    BackupEncryption = $true
}

function Write-SecurityLog {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [SECURITY] [$Level] $Message"
    Write-Host $LogMessage
    
    $LogDir = "$AppDir\logs"
    if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
    Add-Content -Path "$LogDir\security.log" -Value $LogMessage
    
    # Also log to Windows Event Log
    try {
        $EventSource = "MochiPort Security"
        if (-not [System.Diagnostics.EventLog]::SourceExists($EventSource)) {
            New-EventLog -LogName Application -Source $EventSource
        }
        Write-EventLog -LogName Application -Source $EventSource -EventId 3001 -EntryType Information -Message $Message
    } catch {
        # Ignore event log errors
    }
}

function Enable-WindowsFirewall {
    Write-SecurityLog "Configuring Windows Firewall rules..."
    
    try {
        # Enable Windows Firewall
        netsh advfirewall set allprofiles state on
        
        # Remove any existing rules
        netsh advfirewall firewall delete rule name="MochiPort Backend" >$null 2>&1
        netsh advfirewall firewall delete rule name="MochiPort Frontend" >$null 2>&1
        netsh advfirewall firewall delete rule name="MochiPort HTTPS" >$null 2>&1
        
        # Add specific rules for MochiPort
        netsh advfirewall firewall add rule name="MochiPort Backend" dir=in action=allow protocol=TCP localport=7071 profile=private,public
        netsh advfirewall firewall add rule name="MochiPort Frontend" dir=in action=allow protocol=TCP localport=3000 profile=private,public
        netsh advfirewall firewall add rule name="MochiPort HTTPS" dir=in action=allow protocol=TCP localport=443 profile=private,public
        
        # Block common attack ports
        $BlockPorts = @(22, 23, 135, 139, 445, 1433, 3389, 5432)
        foreach ($port in $BlockPorts) {
            netsh advfirewall firewall add rule name="Block Port $port" dir=in action=block protocol=TCP localport=$port
        }
        
        Write-SecurityLog "Windows Firewall configured successfully"
        return $true
    } catch {
        Write-SecurityLog "Failed to configure Windows Firewall: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Setup-HTTPS {
    Write-SecurityLog "Setting up HTTPS configuration..."
    
    $SSLDir = "$AppDir\ssl"
    if (-not (Test-Path $SSLDir)) {
        New-Item -ItemType Directory -Path $SSLDir -Force | Out-Null
    }
    
    $CertPath = "$SSLDir\mochiport.crt"
    $KeyPath = "$SSLDir\mochiport.key"
    
    # Check if certificates exist
    if (-not (Test-Path $CertPath) -or -not (Test-Path $KeyPath)) {
        Write-SecurityLog "Generating self-signed SSL certificate..."
        
        try {
            # Generate self-signed certificate using OpenSSL or PowerShell
            $cert = New-SelfSignedCertificate -DnsName "localhost", "mochiport.local" -CertStoreLocation "cert:\LocalMachine\My" -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256 -KeyUsage DigitalSignature, KeyEncipherment -Type SSLServerAuthentication
            
            # Export certificate and private key
            $certPassword = ConvertTo-SecureString -String "MochiPort2024!" -Force -AsPlainText
            Export-PfxCertificate -Cert $cert -FilePath "$SSLDir\mochiport.pfx" -Password $certPassword
            
            # Create OpenSSL compatible files
            openssl pkcs12 -in "$SSLDir\mochiport.pfx" -out $CertPath -clcerts -nokeys -passin pass:MochiPort2024!
            openssl pkcs12 -in "$SSLDir\mochiport.pfx" -out $KeyPath -nocerts -nodes -passin pass:MochiPort2024!
            
            Write-SecurityLog "SSL certificate generated successfully"
        } catch {
            Write-SecurityLog "Failed to generate SSL certificate: $($_.Exception.Message)" "ERROR"
            
            # Fallback: Create instructions for manual certificate generation
            $Instructions = @"
To generate SSL certificates manually:

1. Using OpenSSL:
   openssl req -x509 -newkey rsa:2048 -keyout $KeyPath -out $CertPath -days 365 -nodes -subj "/CN=localhost"

2. Using mkcert (recommended for development):
   mkcert -install
   mkcert localhost 127.0.0.1 ::1

3. For production, obtain certificates from:
   - Let's Encrypt (free)
   - Commercial CA (Symantec, DigiCert, etc.)

Place the certificate files in: $SSLDir
"@
            Set-Content -Path "$SSLDir\SSL_SETUP_INSTRUCTIONS.txt" -Value $Instructions
            Write-SecurityLog "SSL setup instructions created in $SSLDir\SSL_SETUP_INSTRUCTIONS.txt"
        }
    }
    
    # Update backend configuration for HTTPS
    $BackendEnvPath = "$AppDir\backend\.env.production"
    if (Test-Path $BackendEnvPath) {
        $envContent = Get-Content $BackendEnvPath
        $envContent = $envContent | Where-Object { $_ -notmatch "^HTTPS_" }
        $envContent += "HTTPS_ENABLED=true"
        $envContent += "HTTPS_CERT_PATH=$CertPath"
        $envContent += "HTTPS_KEY_PATH=$KeyPath"
        $envContent += "HTTPS_PORT=443"
        Set-Content -Path $BackendEnvPath -Value $envContent
        Write-SecurityLog "Backend HTTPS configuration updated"
    }
    
    return $true
}

function Configure-SecurityHeaders {
    Write-SecurityLog "Configuring security headers..."
    
    $SecurityMiddlewarePath = "$AppDir\backend\src\middleware\security.ts"
    
    $SecurityMiddleware = @'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'https://localhost:3000',
      'https://localhost:443',
      'https://127.0.0.1:3000',
      'https://127.0.0.1:443'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (allowedIPs.includes(clientIP) || allowedIPs.includes('127.0.0.1')) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent}`);
  next();
};
'@
    
    if (-not (Test-Path (Split-Path $SecurityMiddlewarePath))) {
        New-Item -ItemType Directory -Path (Split-Path $SecurityMiddlewarePath) -Force | Out-Null
    }
    Set-Content -Path $SecurityMiddlewarePath -Value $SecurityMiddleware
    
    Write-SecurityLog "Security middleware created"
    return $true
}

function Configure-Authentication {
    Write-SecurityLog "Configuring authentication system..."
    
    $AuthConfig = @'
{
  "authentication": {
    "enabled": true,
    "type": "jwt",
    "jwtSecret": "CHANGE_THIS_IN_PRODUCTION",
    "jwtExpiration": "24h",
    "bcryptRounds": 12,
    "sessionTimeout": 3600,
    "maxLoginAttempts": 5,
    "lockoutDuration": 900,
    "requireEmailVerification": false,
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true
    }
  },
  "authorization": {
    "roles": ["admin", "user", "viewer"],
    "defaultRole": "user",
    "adminUsers": []
  }
}
'@
    
    $AuthConfigPath = "$AppDir\config\auth-config.json"
    if (-not (Test-Path (Split-Path $AuthConfigPath))) {
        New-Item -ItemType Directory -Path (Split-Path $AuthConfigPath) -Force | Out-Null
    }
    Set-Content -Path $AuthConfigPath -Value $AuthConfig
    
    # Update environment variables
    $BackendEnvPath = "$AppDir\backend\.env.production"
    if (Test-Path $BackendEnvPath) {
        $envContent = Get-Content $BackendEnvPath
        $envContent = $envContent | Where-Object { $_ -notmatch "^JWT_" -and $_ -notmatch "^AUTH_" }
        $envContent += "AUTH_ENABLED=true"
        $envContent += "JWT_SECRET=$(([System.Web.Security.Membership]::GeneratePassword(64, 10)))"
        $envContent += "AUTH_CONFIG_PATH=$AuthConfigPath"
        Set-Content -Path $BackendEnvPath -Value $envContent
        Write-SecurityLog "Authentication configuration updated"
    }
    
    return $true
}

function Test-SecurityConfiguration {
    Write-SecurityLog "Auditing security configuration..."
    
    $SecurityReport = @{
        Timestamp = Get-Date
        Firewall = @{}
        HTTPS = @{}
        Authentication = @{}
        Environment = @{}
        Recommendations = @()
    }
    
    # Check Windows Firewall
    try {
        $firewallStatus = netsh advfirewall show allprofiles state
        $SecurityReport.Firewall.Enabled = $firewallStatus -match "ON"
        $SecurityReport.Firewall.Rules = @()
        
        $rules = netsh advfirewall firewall show rule name=all | Select-String "Rule Name|Direction|Action|Protocol|Local Port"
        $SecurityReport.Firewall.Rules = $rules
    } catch {
        $SecurityReport.Firewall.Error = $_.Exception.Message
        $SecurityReport.Recommendations += "Configure Windows Firewall"
    }
    
    # Check HTTPS configuration
    $SSLDir = "$AppDir\ssl"
    $SecurityReport.HTTPS.CertificateExists = Test-Path "$SSLDir\mochiport.crt"
    $SecurityReport.HTTPS.PrivateKeyExists = Test-Path "$SSLDir\mochiport.key"
    
    if (-not $SecurityReport.HTTPS.CertificateExists) {
        $SecurityReport.Recommendations += "Generate SSL certificates"
    }
    
    # Check authentication configuration
    $AuthConfigPath = "$AppDir\config\auth-config.json"
    $SecurityReport.Authentication.ConfigExists = Test-Path $AuthConfigPath
    
    if (-not $SecurityReport.Authentication.ConfigExists) {
        $SecurityReport.Recommendations += "Configure authentication system"
    }
    
    # Check environment variables
    $BackendEnvPath = "$AppDir\backend\.env.production"
    if (Test-Path $BackendEnvPath) {
        $envContent = Get-Content $BackendEnvPath
        $SecurityReport.Environment.HasJWTSecret = $envContent -match "JWT_SECRET="
        $SecurityReport.Environment.HasHTTPSConfig = $envContent -match "HTTPS_ENABLED="
        $SecurityReport.Environment.HasAuthConfig = $envContent -match "AUTH_ENABLED="
        
        # Check for default/weak configurations
        if ($envContent -match "JWT_SECRET=your-secret-key" -or $envContent -match "JWT_SECRET=development") {
            $SecurityReport.Recommendations += "Change default JWT secret"
        }
        
        if ($envContent -match "NODE_ENV=development") {
            $SecurityReport.Recommendations += "Set NODE_ENV to production"
        }
    } else {
        $SecurityReport.Recommendations += "Create production environment configuration"
    }
    
    # Check file permissions
    $AppDirAcl = Get-Acl $AppDir
    $SecurityReport.Environment.FilePermissions = $AppDirAcl.Access | Select-Object IdentityReference, FileSystemRights, AccessControlType
    
    # Generate report
    $ReportPath = "$AppDir\logs\security-audit-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $SecurityReport | ConvertTo-Json -Depth 10 | Set-Content -Path $ReportPath
    
    Write-SecurityLog "Security audit completed. Report saved to: $ReportPath"
    
    # Display summary
    Write-Host "`nSecurity Audit Summary:" -ForegroundColor Yellow
    Write-Host "======================" -ForegroundColor Yellow
    Write-Host "Firewall Enabled: $(if ($SecurityReport.Firewall.Enabled) { '✓' } else { '✗' })" -ForegroundColor $(if ($SecurityReport.Firewall.Enabled) { 'Green' } else { 'Red' })
    Write-Host "SSL Certificate: $(if ($SecurityReport.HTTPS.CertificateExists) { '✓' } else { '✗' })" -ForegroundColor $(if ($SecurityReport.HTTPS.CertificateExists) { 'Green' } else { 'Red' })
    Write-Host "Authentication Config: $(if ($SecurityReport.Authentication.ConfigExists) { '✓' } else { '✗' })" -ForegroundColor $(if ($SecurityReport.Authentication.ConfigExists) { 'Green' } else { 'Red' })
    
    if ($SecurityReport.Recommendations.Count -gt 0) {
        Write-Host "`nRecommendations:" -ForegroundColor Yellow
        foreach ($rec in $SecurityReport.Recommendations) {
            Write-Host "- $rec" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`n✓ No security issues found!" -ForegroundColor Green
    }
    
    return $SecurityReport
}

function Configure-AllSecurity {
    Write-SecurityLog "Starting comprehensive security configuration..."
    
    $Results = @{
        Firewall = $false
        HTTPS = $false
        SecurityHeaders = $false
        Authentication = $false
    }
    
    # Configure Windows Firewall
    if ($SecurityConfig.EnableFirewall) {
        $Results.Firewall = Enable-WindowsFirewall
    }
    
    # Setup HTTPS
    if ($SecurityConfig.EnableHTTPS) {
        $Results.HTTPS = Setup-HTTPS
    }
    
    # Configure security headers
    if ($SecurityConfig.SecureHeaders) {
        $Results.SecurityHeaders = Configure-SecurityHeaders
    }
    
    # Configure authentication
    if ($SecurityConfig.RequireAuthentication) {
        $Results.Authentication = Configure-Authentication
    }
    
    # Create security checklist
    $ChecklistPath = "$AppDir\SECURITY_CHECKLIST.md"
    $Checklist = @"
# MochiPort Security Checklist

## Completed Configuration
- [$(if($Results.Firewall){'x'}else{' '})] Windows Firewall configured
- [$(if($Results.HTTPS){'x'}else{' '})] HTTPS/SSL certificates setup
- [$(if($Results.SecurityHeaders){'x'}else{' '})] Security headers middleware
- [$(if($Results.Authentication){'x'}else{' '})] Authentication system

## Manual Tasks Required
- [ ] Change default JWT secret in .env.production
- [ ] Configure IP whitelist if needed
- [ ] Set up SSL certificates for production domain
- [ ] Configure backup encryption
- [ ] Set up monitoring alerts
- [ ] Review and update security policies
- [ ] Test authentication flow
- [ ] Perform security penetration testing

## Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Rotate SSL certificates annually
- [ ] Update security configurations quarterly
- [ ] Backup security configurations

## Emergency Procedures
- [ ] Document incident response plan
- [ ] Set up emergency contacts
- [ ] Configure automatic security alerts
- [ ] Test recovery procedures

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@
    
    Set-Content -Path $ChecklistPath -Value $Checklist
    Write-SecurityLog "Security checklist created: $ChecklistPath"
    
    Write-SecurityLog "Security configuration completed. Results: Firewall=$($Results.Firewall), HTTPS=$($Results.HTTPS), Headers=$($Results.SecurityHeaders), Auth=$($Results.Authentication)"
    
    return $Results
}

# Main execution
switch ($true) {
    $Configure {
        Configure-AllSecurity
    }
    $AuditSecurity {
        Test-SecurityConfiguration
    }
    $SetupHTTPS {
        Setup-HTTPS
    }
    $EnableFirewall {
        Enable-WindowsFirewall
    }
    $ConfigureAuthentication {
        Configure-Authentication
    }
    default {
        Write-Host "MochiPort Windows Security Configuration"
        Write-Host "Usage:"
        Write-Host "  -Configure              : Configure all security settings"
        Write-Host "  -AuditSecurity          : Audit current security configuration"
        Write-Host "  -SetupHTTPS             : Setup HTTPS/SSL certificates"
        Write-Host "  -EnableFirewall         : Configure Windows Firewall"
        Write-Host "  -ConfigureAuthentication: Setup authentication system"
        Write-Host ""
        Write-Host "Example: .\security-config.ps1 -Configure"
    }
}
