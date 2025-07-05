#!/bin/bash
# GitHub Pages用のローカルビルドスクリプト

set -e

echo "Building MochiPort for GitHub Pages..."

# 環境変数の設定
export GITHUB_PAGES=true
export NEXT_PUBLIC_BASE_PATH=/mochiport
export NEXT_PUBLIC_USE_MOCK_DATA=true
export NEXT_PUBLIC_ENABLE_REALTIME=false

# リポジトリ名を取得（実際のリポジトリ名に変更してください）
REPO_OWNER=${GITHUB_REPOSITORY_OWNER:-"your-username"}
export NEXT_PUBLIC_API_URL="https://${REPO_OWNER}.github.io/mochiport/api"

echo "Building with settings:"
echo "  NEXT_PUBLIC_BASE_PATH: $NEXT_PUBLIC_BASE_PATH"
echo "  NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "  NEXT_PUBLIC_USE_MOCK_DATA: $NEXT_PUBLIC_USE_MOCK_DATA"

# 依存関係のインストール
echo "Installing dependencies..."
yarn install --frozen-lockfile

# Sharedパッケージのビルド
echo "Building shared package..."
yarn workspace @mochiport/shared build

# フロントエンドのビルド
echo "Building frontend..."
yarn workspace @mochiport/frontend build

# モックAPIレスポンスの作成
echo "Creating mock API responses..."
mkdir -p frontend/out/api

# Health API
echo '{"status":"ok","message":"GitHub Pages Mock API","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > frontend/out/api/health.json

# Conversations API
mkdir -p frontend/out/api/conversations
echo '[{
  "id":"1",
  "title":"Welcome to MochiPort",
  "messages":[
    {
      "id":"1",
      "content":"Welcome to MochiPort! This is a demo conversation running on GitHub Pages.",
      "role":"assistant",
      "timestamp":"2025-06-28T00:00:00Z"
    },
    {
      "id":"2", 
      "content":"This is a static deployment, so AI features are simulated.",
      "role":"user",
      "timestamp":"2025-06-28T00:01:00Z"
    }
  ],
  "createdAt":"2025-06-28T00:00:00Z",
  "updatedAt":"2025-06-28T00:01:00Z",
  "status":"active"
}]' > frontend/out/api/conversations/index.json

# Drafts API
mkdir -p frontend/out/api/drafts
echo '[{
  "id":"1",
  "title":"Sample Draft Document",
  "content":"This is a sample draft document showcasing the draft management feature of MochiPort. In a real deployment, you could create, edit, and manage your draft documents here.",
  "type":"note",
  "status":"draft",
  "createdAt":"2025-06-28T00:00:00Z",
  "updatedAt":"2025-06-28T00:00:00Z",
  "metadata":{
    "tags":["demo","github-pages","sample"]
  }
}]' > frontend/out/api/drafts/index.json

# Reminders API  
mkdir -p frontend/out/api/reminders
echo '[{
  "id":"1",
  "conversationId":"1",
  "title":"Check GitHub Pages Deployment",
  "description":"Verify that the MochiPort application is working correctly on GitHub Pages",
  "dueDate":"2025-12-31T23:59:59Z",
  "scheduledAt":"2025-12-31T23:59:59Z",
  "createdAt":"2025-06-28T00:00:00Z",
  "updatedAt":"2025-06-28T00:00:00Z",
  "status":"pending",
  "type":"task",
  "priority":"medium"
}]' > frontend/out/api/reminders/index.json

# .nojekyllファイルの追加（GitHub Pagesで_から始まるファイルを無視させないため）
echo "Adding .nojekyll file..."
touch frontend/out/.nojekyll

# READMEの追加
echo "Creating GitHub Pages README..."
cat > frontend/out/README.md << 'EOF'
# MochiPort - GitHub Pages Demo

This is a static deployment of MochiPort running on GitHub Pages.

## Features Demonstrated

- ✅ Frontend UI components
- ✅ Routing and navigation  
- ✅ Mock data display
- ✅ Responsive design
- ⚠️ AI features (simulated)
- ⚠️ Real-time features (disabled)

## Limitations

This GitHub Pages deployment is for demonstration purposes only:

- No backend server (all API calls return mock data)
- No real AI integration
- No data persistence
- No real-time features

For full functionality, deploy the complete frontend + backend stack.

## Repository

Visit the [main repository](https://github.com/your-username/mochiport) for the complete application.
EOF

echo "✅ GitHub Pages build completed!"
echo "📁 Output directory: frontend/out"
echo "🌐 Ready for deployment to GitHub Pages"
