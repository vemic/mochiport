# GitHub Pages 独自ドメイン公開ガイド

## 概要

MochiPortアプリケーションを独自ドメイン（static.vemi.jp）でGitHub Pagesに公開するためのガイドです。

## 前提条件

1. GitHubリポジトリが作成済み
2. ドメイン（static.vemi.jp）の所有権とDNS管理権限
3. Node.js 18以上とYarnがインストール済み

## DNS設定

### 1. CNAMEレコードの設定

ドメイン管理画面で以下のCNAMEレコードを設定：

```
static.vemi.jp  →  your-username.github.io
```

### 2. DNS伝播の確認

設定後、DNS伝播を確認：

```bash
nslookup static.vemi.jp
```

## GitHub Pages設定

### 1. リポジトリ設定

1. GitHubリポジトリの「Settings」→「Pages」へ移動
2. 「Source」で「GitHub Actions」を選択
3. 「Custom domain」に `static.vemi.jp` を入力
4. 「Enforce HTTPS」を有効化

### 2. 自動デプロイ設定

独自ドメイン用のワークフローファイルが作成済み：
- `.github/workflows/deploy-custom-domain.yml`

## ローカルビルド

### Windows環境

独自ドメイン用ビルドスクリプトを実行：

```cmd
.\scripts\build-custom-domain.bat
```

### Linux/macOS環境

```bash
# 環境変数設定
export NODE_ENV=production
export GITHUB_PAGES=true
export NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN=true

# 依存関係インストール
yarn install

# 共有パッケージビルド
yarn workspace @mochiport/shared build

# 環境設定コピー
cp frontend/.env.custom-domain frontend/.env.local

# フロントエンドビルド
yarn workspace @mochiport/frontend build:custom-domain

# CNAMEファイル作成
echo "static.vemi.jp" > frontend/out/CNAME
```

## 環境設定

### frontend/.env.custom-domain

独自ドメイン用の環境変数：

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://static.vemi.jp/api
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_ASSET_PREFIX=

# Mock Configuration
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_STATIC_GENERATION=true

# Domain Configuration
NEXT_PUBLIC_CUSTOM_DOMAIN=static.vemi.jp
NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN=true

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=true
```

## デプロイプロセス

### 自動デプロイ

1. `main`ブランチにコードをプッシュ
2. GitHub Actionsが自動実行
3. ビルド→モックAPIデータ生成→CNAMEファイル作成→デプロイ

### 手動デプロイ

1. ローカルでビルド実行
2. `frontend/out`ディレクトリの内容をgh-pagesブランチにアップロード
3. GitHub Pagesが自動更新

## ファイル構成

```
frontend/out/
├── CNAME                     # 独自ドメイン設定
├── _next/                    # Next.jsアセット
├── api/                      # モックAPIデータ
│   ├── conversations.json
│   ├── drafts.json
│   └── reminders.json
├── index.html               # トップページ
└── ...                      # その他の静的ファイル
```

## 設定の違い

### 通常のGitHub Pages vs 独自ドメイン

| 項目 | 通常 | 独自ドメイン |
|------|------|-------------|
| basePath | `/repository-name` | なし |
| assetPrefix | `/repository-name` | なし |
| CNAME | 不要 | 必要 |
| DNS設定 | 不要 | 必要 |

## トラブルシューティング

### 1. 404エラーが発生する場合

- DNS設定の確認
- CNAMEファイルが正しく配置されているか確認
- GitHub Pagesの設定確認

### 2. CSS/JSが読み込まれない場合

- 環境変数`NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN=true`が設定されているか確認
- basePath/assetPrefixが空文字になっているか確認

### 3. API呼び出しエラー

- モックAPIファイル（JSON）が正しく生成されているか確認
- APIパスが正しいか確認

## セキュリティ考慮事項

1. **HTTPS強制**: GitHub Pagesで必ずHTTPSを有効化
2. **モックデータ**: 機密情報を含まないサンプルデータのみ使用
3. **APIキー**: 静的サイトでは秘密情報を含めない

## 監視・メンテナンス

### アクセス監視

GitHub Pagesのアクセス統計で以下を監視：
- アクセス数
- 参照元
- デバイス種別

### 定期メンテナンス

1. 月次でのライブラリ更新
2. セキュリティアップデート適用
3. DNSレコードの有効性確認

## 参考リンク

- [GitHub Pages公式ドキュメント](https://docs.github.com/pages)
- [Next.js静的エクスポート](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [独自ドメインの設定](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)
