# MochiPort GitHub Pages デプロイメントガイド

このガイドでは、MochiPortをGitHub Pagesで静的サイトとしてデプロイする方法を説明します。

## デプロイメントオプション

### 🔗 通常のGitHub Pages
- URL: `https://username.github.io/repository-name`
- 設定ファイル: `.github/workflows/deploy-github-pages.yml`
- ビルドスクリプト: `scripts/build-github-pages.bat`

### 🏠 独自ドメイン対応
- URL: `https://static.vemi.jp`
- 設定ファイル: `.github/workflows/deploy-custom-domain.yml`
- ビルドスクリプト: `scripts/build-custom-domain.bat`
- 詳細ガイド: [CUSTOM_DOMAIN_DEPLOYMENT.md](./CUSTOM_DOMAIN_DEPLOYMENT.md)

## 概要

GitHub Pages用のデプロイメントでは以下の特徴があります：

### ✅ 利用可能な機能
- フロントエンドUI（React + Next.js）
- ルーティング・ナビゲーション
- モックデータの表示
- レスポンシブデザイン
- 基本的なフォーム操作

### ⚠️ 制限事項
- バックエンドサーバーなし（すべてモックデータ）
- AI機能なし（シミュレート応答のみ）
- データ永続化なし
- リアルタイム機能なし
- 実際のデータベース接続なし

## セットアップ手順

### 1. リポジトリの準備

```bash
# GitHubにプッシュ
git add .
git commit -m "Add GitHub Pages configuration"
git push origin main
```

### 2. GitHub Pagesの有効化

1. GitHubリポジトリの **Settings** タブに移動
2. 左サイドバーの **Pages** をクリック
3. **Source** を **GitHub Actions** に設定
4. 保存

### 3. 環境変数の設定（オプション）

リポジトリの **Settings > Secrets and variables > Actions** で以下を設定：

```
GITHUB_REPOSITORY_OWNER: your-username  # 自動設定されますが、必要に応じて
```

### 4. デプロイの実行

GitHubにプッシュすると自動的にデプロイが開始されます：

```bash
git push origin main
```

**Actions** タブでデプロイの進行状況を確認できます。

## ローカルでのテスト

### Windows

```cmd
# GitHub Pages用ビルドの実行
yarn build:github

# または直接スクリプトを実行
scripts\build-github-pages.bat
```

### Linux/Mac

```bash
# 実行権限を付与
chmod +x scripts/build-github-pages.sh

# ビルドの実行
./scripts/build-github-pages.sh
```

ビルド後、`frontend/out` ディレクトリに静的ファイルが生成されます。

## カスタマイズ

### 1. リポジトリ名の変更

`scripts/build-github-pages.bat` または `scripts/build-github-pages.sh` で以下を変更：

```bash
# 現在の設定
export NEXT_PUBLIC_BASE_PATH=/mochiport

# カスタムリポジトリ名の場合
export NEXT_PUBLIC_BASE_PATH=/your-repo-name
```

### 2. モックデータの追加・変更

以下のファイルでモックデータをカスタマイズできます：

- `frontend/src/lib/api/github-pages-client.ts` - APIクライアント
- `.github/workflows/deploy-github-pages.yml` - ワークフロー内のモックデータ生成

### 3. 追加のAPIエンドポイント

新しいモックAPIエンドポイントを追加する場合：

1. `github-pages-client.ts` にメソッドを追加
2. ビルドスクリプトでJSONファイルを生成
3. ワークフローでファイル作成を追加

## トラブルシューティング

### よくある問題

#### 1. 404エラー（ページが見つからない）

**原因**: Base pathの設定ミス

**解決方法**:
```typescript
// next.config.ts で確認
basePath: process.env.GITHUB_PAGES === 'true' ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '',
```

#### 2. CSSや画像が読み込まれない

**原因**: Asset prefixの設定ミス

**解決方法**:
```typescript
// next.config.ts で確認
assetPrefix: process.env.GITHUB_PAGES === 'true' ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '',
```

#### 3. APIが404エラー

**原因**: モックAPIファイルが生成されていない

**解決方法**:
- ビルドスクリプトでJSONファイルが作成されているか確認
- `.nojekyll` ファイルが存在するか確認

#### 4. ルーティングが機能しない

**原因**: SPAモードでの設定不備

**解決方法**:
```typescript
// next.config.ts で確認
trailingSlash: true,
output: 'export',
```

### デバッグ方法

#### 1. ローカルでのテスト

```cmd
# ローカルサーバーで確認
cd frontend/out
python -m http.server 8000
# または
npx serve .
```

#### 2. ビルドログの確認

GitHub Actionsの **Actions** タブでビルドログを確認。

#### 3. ブラウザの開発者ツール

- Console でJavaScriptエラーを確認
- Network タブでAPIリクエストを確認

## 本格運用への移行

GitHub Pagesデモから本格運用に移行する場合：

### 1. バックエンドのデプロイ

```bash
# 推奨プラットフォーム
- Vercel（フロントエンド + サーバーレス関数）
- Netlify（フロントエンド + Edge Functions）
- Railway（フルスタック）
- AWS/Azure/GCP（フルスタック）
```

### 2. データベースの設定

```bash
# 推奨データベース
- Supabase（PostgreSQL + リアルタイム機能）
- PlanetScale（MySQL）
- MongoDB Atlas
- AWS RDS/Azure SQL
```

### 3. AI機能の設定

```bash
# AI サービス
- Azure OpenAI
- OpenAI API
- AWS Bedrock
- Google Cloud AI
```

## パフォーマンス最適化

### 1. 画像最適化

```typescript
// next.config.ts
images: {
  unoptimized: process.env.GITHUB_PAGES === 'true' ? true : false,
},
```

### 2. バンドルサイズ最適化

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react'],
},
```

### 3. キャッシュ設定

```yaml
# .github/workflows/deploy-github-pages.yml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.yarn
      **/node_modules
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
```

## 関連リンク

- [GitHub Pages ドキュメント](https://docs.github.com/pages)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions ワークフロー](https://docs.github.com/actions)

---

GitHub Pagesデプロイメントに関する質問や問題があれば、Issuesでお知らせください。
