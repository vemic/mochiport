@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  MochiPort Custom Domain Build Script
echo  Target: static.vemi.jp
echo ========================================

:: Set custom domain environment variables
set NODE_ENV=production
set GITHUB_PAGES=true
set NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN=true

:: Check if required tools are available
echo Checking required tools...
where yarn >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: yarn is not installed or not in PATH
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Clean previous builds
echo Cleaning previous builds...
if exist "frontend\.next" rmdir /s /q "frontend\.next"
if exist "frontend\out" rmdir /s /q "frontend\out"

:: Install dependencies
echo Installing dependencies...
call yarn install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

:: Build shared package
echo Building shared package...
call yarn workspace @mochiport/shared build
if %errorlevel% neq 0 (
    echo Error: Failed to build shared package
    pause
    exit /b 1
)

:: Copy custom domain environment file
echo Setting up custom domain environment...
if exist "frontend\.env.custom-domain" (
    copy "frontend\.env.custom-domain" "frontend\.env.local"
    echo Custom domain environment copied successfully
) else (
    echo Warning: .env.custom-domain not found, using default settings
)

:: Build frontend for custom domain
echo Building frontend for custom domain...
call yarn workspace @mochiport/frontend build:custom-domain
if %errorlevel% neq 0 (
    echo Error: Failed to build frontend
    pause
    exit /b 1
)

:: Generate mock API data
echo Generating mock API data...
if not exist "frontend\out\api" mkdir "frontend\out\api"

:: Generate conversations.json
echo { > "frontend\out\api\conversations.json"
echo   "conversations": [ >> "frontend\out\api\conversations.json"
echo     { >> "frontend\out\api\conversations.json"
echo       "id": "1", >> "frontend\out\api\conversations.json"
echo       "title": "新しい機能について", >> "frontend\out\api\conversations.json"
echo       "createdAt": "2024-01-15T09:00:00Z", >> "frontend\out\api\conversations.json"
echo       "updatedAt": "2024-01-15T09:30:00Z", >> "frontend\out\api\conversations.json"
echo       "userId": "user-1", >> "frontend\out\api\conversations.json"
echo       "messages": [ >> "frontend\out\api\conversations.json"
echo         { >> "frontend\out\api\conversations.json"
echo           "id": "msg-1", >> "frontend\out\api\conversations.json"
echo           "content": "新しい機能の提案があります", >> "frontend\out\api\conversations.json"
echo           "role": "user", >> "frontend\out\api\conversations.json"
echo           "timestamp": "2024-01-15T09:00:00Z" >> "frontend\out\api\conversations.json"
echo         }, >> "frontend\out\api\conversations.json"
echo         { >> "frontend\out\api\conversations.json"
echo           "id": "msg-2", >> "frontend\out\api\conversations.json"
echo           "content": "詳しく教えてください", >> "frontend\out\api\conversations.json"
echo           "role": "assistant", >> "frontend\out\api\conversations.json"
echo           "timestamp": "2024-01-15T09:05:00Z" >> "frontend\out\api\conversations.json"
echo         } >> "frontend\out\api\conversations.json"
echo       ] >> "frontend\out\api\conversations.json"
echo     } >> "frontend\out\api\conversations.json"
echo   ] >> "frontend\out\api\conversations.json"
echo } >> "frontend\out\api\conversations.json"

:: Generate drafts.json
echo { > "frontend\out\api\drafts.json"
echo   "drafts": [ >> "frontend\out\api\drafts.json"
echo     { >> "frontend\out\api\drafts.json"
echo       "id": "draft-1", >> "frontend\out\api\drafts.json"
echo       "title": "プロジェクト提案書", >> "frontend\out\api\drafts.json"
echo       "content": "新しいプロジェクトの提案内容...", >> "frontend\out\api\drafts.json"
echo       "createdAt": "2024-01-15T10:00:00Z", >> "frontend\out\api\drafts.json"
echo       "updatedAt": "2024-01-15T10:30:00Z", >> "frontend\out\api\drafts.json"
echo       "userId": "user-1", >> "frontend\out\api\drafts.json"
echo       "tags": ["提案", "プロジェクト"], >> "frontend\out\api\drafts.json"
echo       "isPublished": false >> "frontend\out\api\drafts.json"
echo     } >> "frontend\out\api\drafts.json"
echo   ] >> "frontend\out\api\drafts.json"
echo } >> "frontend\out\api\drafts.json"

:: Generate reminders.json
echo { > "frontend\out\api\reminders.json"
echo   "reminders": [ >> "frontend\out\api\reminders.json"
echo     { >> "frontend\out\api\reminders.json"
echo       "id": "reminder-1", >> "frontend\out\api\reminders.json"
echo       "title": "会議の準備", >> "frontend\out\api\reminders.json"
echo       "description": "明日の会議の資料を準備する", >> "frontend\out\api\reminders.json"
echo       "dueDate": "2024-01-16T14:00:00Z", >> "frontend\out\api\reminders.json"
echo       "isCompleted": false, >> "frontend\out\api\reminders.json"
echo       "priority": "high", >> "frontend\out\api\reminders.json"
echo       "userId": "user-1", >> "frontend\out\api\reminders.json"
echo       "createdAt": "2024-01-15T11:00:00Z", >> "frontend\out\api\reminders.json"
echo       "updatedAt": "2024-01-15T11:00:00Z" >> "frontend\out\api\reminders.json"
echo     } >> "frontend\out\api\reminders.json"
echo   ] >> "frontend\out\api\reminders.json"
echo } >> "frontend\out\api\reminders.json"

:: Create CNAME file for custom domain
echo Creating CNAME file...
echo static.vemi.jp > "frontend\out\CNAME"

:: Display build information
echo.
echo ========================================
echo  Build completed successfully!
echo ========================================
echo Target Domain: static.vemi.jp
echo Output Directory: frontend\out
echo CNAME File: Created
echo Mock API: Generated
echo.
echo Files ready for GitHub Pages deployment:
dir "frontend\out" /b
echo.
echo To deploy manually:
echo 1. Ensure GitHub Pages is enabled for your repository
echo 2. Set custom domain to 'static.vemi.jp' in repository settings
echo 3. Upload the contents of frontend\out to your gh-pages branch
echo.

pause
