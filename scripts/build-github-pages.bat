@echo off
REM GitHub Pages用のWindowsビルドスクリプト

echo Building MochiPort for GitHub Pages...

REM 環境変数の設定
set GITHUB_PAGES=true
set NEXT_PUBLIC_BASE_PATH=/mochiport
set NEXT_PUBLIC_USE_MOCK_DATA=true
set NEXT_PUBLIC_ENABLE_REALTIME=false

REM リポジトリ名を設定（実際のリポジトリ名に変更してください）
if "%GITHUB_REPOSITORY_OWNER%"=="" set GITHUB_REPOSITORY_OWNER=your-username
set NEXT_PUBLIC_API_URL=https://%GITHUB_REPOSITORY_OWNER%.github.io/mochiport/api

echo Building with settings:
echo   NEXT_PUBLIC_BASE_PATH: %NEXT_PUBLIC_BASE_PATH%
echo   NEXT_PUBLIC_API_URL: %NEXT_PUBLIC_API_URL%
echo   NEXT_PUBLIC_USE_MOCK_DATA: %NEXT_PUBLIC_USE_MOCK_DATA%

REM 依存関係のインストール
echo Installing dependencies...
call yarn install --frozen-lockfile
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

REM Sharedパッケージのビルド
echo Building shared package...
call yarn workspace @mochiport/shared build
if %errorlevel% neq 0 (
    echo Error: Failed to build shared package
    exit /b 1
)

REM フロントエンドのビルド
echo Building frontend...
call yarn workspace @mochiport/frontend build:github
if %errorlevel% neq 0 (
    echo Error: Failed to build frontend
    exit /b 1
)

REM モックAPIレスポンスの作成
echo Creating mock API responses...
if not exist "frontend\out\api" mkdir frontend\out\api

REM Health API
echo {"status":"ok","message":"GitHub Pages Mock API","timestamp":"%date:~10,4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z"} > frontend\out\api\health.json

REM Conversations API
if not exist "frontend\out\api\conversations" mkdir frontend\out\api\conversations
(
echo [{
echo   "id":"1",
echo   "title":"Welcome to MochiPort",
echo   "messages":[
echo     {
echo       "id":"1",
echo       "content":"Welcome to MochiPort! This is a demo conversation running on GitHub Pages.",
echo       "role":"assistant",
echo       "timestamp":"2025-06-28T00:00:00Z"
echo     },
echo     {
echo       "id":"2",
echo       "content":"This is a static deployment, so AI features are simulated.",
echo       "role":"user",
echo       "timestamp":"2025-06-28T00:01:00Z"
echo     }
echo   ],
echo   "createdAt":"2025-06-28T00:00:00Z",
echo   "updatedAt":"2025-06-28T00:01:00Z",
echo   "status":"active"
echo }]
) > frontend\out\api\conversations\index.json

REM Drafts API
if not exist "frontend\out\api\drafts" mkdir frontend\out\api\drafts
(
echo [{
echo   "id":"1",
echo   "title":"Sample Draft Document",
echo   "content":"This is a sample draft document showcasing the draft management feature of MochiPort.",
echo   "type":"note",
echo   "status":"draft",
echo   "createdAt":"2025-06-28T00:00:00Z",
echo   "updatedAt":"2025-06-28T00:00:00Z",
echo   "metadata":{
echo     "tags":["demo","github-pages","sample"]
echo   }
echo }]
) > frontend\out\api\drafts\index.json

REM Reminders API
if not exist "frontend\out\api\reminders" mkdir frontend\out\api\reminders
(
echo [{
echo   "id":"1",
echo   "conversationId":"1",
echo   "title":"Check GitHub Pages Deployment",
echo   "description":"Verify that the MochiPort application is working correctly on GitHub Pages",
echo   "dueDate":"2025-12-31T23:59:59Z",
echo   "scheduledAt":"2025-12-31T23:59:59Z",
echo   "createdAt":"2025-06-28T00:00:00Z",
echo   "updatedAt":"2025-06-28T00:00:00Z",
echo   "status":"pending",
echo   "type":"task",
echo   "priority":"medium"
echo }]
) > frontend\out\api\reminders\index.json

REM .nojekyllファイルの追加
echo Adding .nojekyll file...
echo. > frontend\out\.nojekyll

REM READMEの追加
echo Creating GitHub Pages README...
(
echo # MochiPort - GitHub Pages Demo
echo.
echo This is a static deployment of MochiPort running on GitHub Pages.
echo.
echo ## Features Demonstrated
echo.
echo - ? Frontend UI components
echo - ? Routing and navigation
echo - ? Mock data display
echo - ? Responsive design
echo - ?? AI features ^(simulated^)
echo - ?? Real-time features ^(disabled^)
echo.
echo ## Limitations
echo.
echo This GitHub Pages deployment is for demonstration purposes only:
echo.
echo - No backend server ^(all API calls return mock data^)
echo - No real AI integration
echo - No data persistence
echo - No real-time features
echo.
echo For full functionality, deploy the complete frontend + backend stack.
echo.
echo ## Repository
echo.
echo Visit the [main repository]^(https://github.com/your-username/mochiport^) for the complete application.
) > frontend\out\README.md

echo.
echo ? GitHub Pages build completed!
echo ? Output directory: frontend\out
echo ? Ready for deployment to GitHub Pages
echo.
echo Next steps:
echo 1. Commit and push your changes to the main branch
echo 2. Enable GitHub Pages in your repository settings
echo 3. Set the source to "GitHub Actions"
echo 4. The workflow will automatically deploy your site

pause
