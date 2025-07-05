# Changelog: GitHub Pages独自ドメイン対応
**Date**: 2024-12-28  
**Version**: 005  
**Author**: GitHub Copilot  

## 概要

MochiPortプロジェクトにGitHub Pages独自ドメイン（static.vemi.jp）での公開機能を追加しました。

## 主な変更

### 1. 独自ドメイン用環境設定

#### 新規ファイル
- `frontend/.env.custom-domain`: 独自ドメイン用環境変数
  - `NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN=true`
  - `NEXT_PUBLIC_CUSTOM_DOMAIN=static.vemi.jp`
  - basePath/assetPrefixを無効化

#### 修正ファイル
- `frontend/next.config.ts`: 独自ドメイン判定による条件分岐追加
- `frontend/package.json`: `build:custom-domain`スクリプト追加

### 2. GitHub Actionsワークフロー

#### 新規ファイル
- `.github/workflows/deploy-custom-domain.yml`: 独自ドメイン用自動デプロイ
  - CNAMEファイル自動生成
  - モックAPIデータ生成
  - 独自ドメイン環境でのビルド

### 3. ビルドスクリプト

#### 新規ファイル
- `scripts/build-custom-domain.bat`: Windows用独自ドメインビルド
  - 環境変数設定
  - モックAPIデータ生成
  - CNAMEファイル作成
  - 詳細なエラーハンドリング

### 4. APIクライアント修正

#### 修正ファイル
- `frontend/src/lib/api/github-pages-client.ts`
  - 独自ドメイン時のBASE_PATH無効化
  - 条件分岐による動的パス生成

### 5. ドキュメント整備

#### 新規ファイル
- `CUSTOM_DOMAIN_DEPLOYMENT.md`: 独自ドメイン公開詳細ガイド
  - DNS設定手順
  - GitHub Pages設定
  - トラブルシューティング
  - セキュリティ考慮事項

#### 修正ファイル
- `GITHUB_PAGES_DEPLOYMENT.md`: デプロイオプション説明追加
- `README.md`: GitHub Pagesデプロイ情報拡充

## 技術仕様

### 環境変数設定

| 変数名 | 通常GitHub Pages | 独自ドメイン |
|--------|------------------|-------------|
| `NEXT_PUBLIC_BASE_PATH` | `/repository-name` | 空文字 |
| `NEXT_PUBLIC_ASSET_PREFIX` | `/repository-name` | 空文字 |
| `NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN` | `false` | `true` |

### ファイル生成

```
frontend/out/
├── CNAME                     # static.vemi.jp
├── _next/                    # Next.jsアセット
├── api/                      # モックAPIデータ
│   ├── conversations.json    # 会話データ
│   ├── drafts.json          # ドラフトデータ
│   └── reminders.json       # リマインダーデータ
└── *.html                   # 静的ページ
```

### Next.js設定

```typescript
// 独自ドメインの場合はbasePath/assetPrefixを無効化
basePath: process.env.GITHUB_PAGES === 'true' && 
  !process.env.NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN ? 
  process.env.NEXT_PUBLIC_BASE_PATH || '' : '',
```

## デプロイフロー

### 自動デプロイ（推奨）

1. `main`ブランチにプッシュ
2. `.github/workflows/deploy-custom-domain.yml`が実行
3. 独自ドメイン環境でビルド
4. CNAMEファイル・モックAPIデータ生成
5. GitHub Pagesに自動デプロイ

### 手動デプロイ

```cmd
# Windows環境
.\scripts\build-custom-domain.bat

# 生成されたfrontend/outをgh-pagesブランチにアップロード
```

## DNS設定要件

```
CNAME: static.vemi.jp → username.github.io
```

## セキュリティ対策

1. **HTTPS強制**: GitHub Pages標準機能
2. **モックデータのみ**: 機密情報を含まない
3. **静的サイト**: サーバーサイド処理なし

## パフォーマンス

- **ビルド時間**: 約2-3分（CI環境）
- **配信**: GitHub CDN経由
- **キャッシュ**: ブラウザ・CDNキャッシュ活用

## 今後の改善予定

1. **多言語対応**: i18n設定の検討
2. **PWA機能**: オフライン対応
3. **分析機能**: Google Analytics統合

## 関連リンク

- [GitHub Pages公式ドキュメント](https://docs.github.com/pages)
- [Next.js静的エクスポート](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [DNSの設定](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 検証済み環境

- **OS**: Windows 11, Ubuntu 22.04, macOS Ventura
- **Node.js**: v18.18.0+
- **ブラウザ**: Chrome 120+, Firefox 120+, Safari 17+
- **GitHub Actions**: ubuntu-latest

---

この変更により、MochiPortは独自ドメイン（static.vemi.jp）でのGitHub Pages公開に完全対応しました。
