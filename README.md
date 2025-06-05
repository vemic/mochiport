# AI チャット管理アプリケーション

拡張性重視のモダンな AI チャット管理システムです。Turborepo monorepo 構成で、フロントエンドに Next.js 15 + React 19、バックエンドに Azure Functions を採用しています。

## 🚀 機能

### 💬 チャット管理

- AI との会話履歴の管理
- メッセージの編集・削除
- 会話のアーカイブ・復元
- 検索機能

### ⏰ リマインダーシステム

- タスクや会話の続きのリマインダー設定
- 優先度と種類による分類
- スヌーズ機能
- 期限切れ通知

### 📝 ドラフト管理

- 下書きの作成・編集
- 自動保存機能
- ドラフトから会話への公開
- アーカイブ機能

## 🏗️ アーキテクチャ

### 拡張性重視の設計思想

プロジェクトは段階的なスケーリングに対応した設計を採用しています：

- **Phase 1 (1-3人)**: useState + カスタムフック
- **Phase 2 (3-10人)**: Zustand + Context API
- **Phase 3 (10人+)**: マイクロフロントエンド + 独立デプロイ

### 責務分離アーキテクチャ

- **Presentation Layer**: UIコンポーネント（状態なし）
- **Container Layer**: 状態管理とビジネスロジック接続
- **Service Layer**: ビジネスロジックの実装
- **Repository Layer**: データアクセス抽象化
- **Infrastructure Layer**: 外部サービス統合

### Monorepo 構成

```
├── frontend/          # Next.js 15 + React 19 アプリケーション
├── backend/           # Azure Functions バックエンド
├── shared/           # 共有型定義・ユーティリティ
└── packages/         # 共有パッケージ
    ├── tsconfig/     # TypeScript 設定
    ├── eslint-config/ # ESLint 設定
    └── ui-components/ # 共有 UI コンポーネント
```

### 技術スタック

**フロントエンド:**

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (状態管理)
- React Query (データフェッチング)
- Radix UI (UI コンポーネント)

**バックエンド:**

- Azure Functions v4
- TypeScript
- Cosmos DB (予定)
- Zod (バリデーション)

**開発ツール:**

- Turborepo (monorepo 管理)
- ESLint + Prettier
- Husky (Git hooks)
- Jest (テスト)

## 🛠️ セットアップ

### 前提条件

- Node.js 22.16.0+ (LTS推奨)
- Yarn 1.22+
- Azure Functions Core Tools v4 (バックエンド開発用)

### インストール

```bash
# 依存関係のインストール
yarn install

# 開発サーバーの起動
yarn dev
```

### 開発サーバー

- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:7071

## 📁 プロジェクト構造

### フロントエンド (frontend/)

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # ダッシュボードレイアウト
│   └── (auth)/            # 認証レイアウト
├── components/            # 共通コンポーネント
│   ├── ui/               # 基本 UI コンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── features/             # 機能別コンポーネント
│   ├── chat/             # チャット機能
│   ├── reminder/         # リマインダー機能
│   └── draft/            # ドラフト機能
├── lib/                  # ライブラリ・ユーティリティ
│   ├── api/              # API クライアント
│   ├── hooks/            # カスタムフック
│   └── stores/           # Zustand ストア
└── styles/               # スタイル定義
```

### バックエンド (backend/)

```
src/
├── functions/            # Azure Functions エンドポイント
│   ├── chat/            # チャット関連 API
│   ├── reminder/        # リマインダー関連 API
│   └── draft/           # ドラフト関連 API
├── services/            # ビジネスロジック
├── repositories/        # データアクセス層
├── middleware/          # ミドルウェア
├── utils/              # ユーティリティ
└── data/               # モックデータ
```

## 🔧 開発ガイド

### スクリプト

```bash
# 全体
yarn dev          # 開発サーバー起動
yarn build        # ビルド
yarn lint         # リント実行
yarn test         # テスト実行

# フロントエンド
yarn workspace frontend dev      # フロントエンドのみ起動
yarn workspace frontend build   # フロントエンドビルド

# バックエンド
yarn workspace backend dev      # バックエンドのみ起動
yarn workspace backend build   # バックエンドビルド
```

### 環境変数

**フロントエンド (.env.local):**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

**バックエンド (.env.development):**

```env
AZURE_FUNCTIONS_ENVIRONMENT=Development
PORT=7071
CORS_ORIGINS=http://localhost:3000
```

## 🧪 テスト

```bash
# 全テスト実行
yarn test

# ウォッチモード
yarn test:watch

# カバレッジ確認
yarn test:coverage
```

## 📦 デプロイ

### フロントエンド (Vercel)

```bash
# Vercel にデプロイ
yarn workspace frontend build
vercel --prod
```

### バックエンド (Azure)

```bash
# Azure Functions にデプロイ
yarn workspace backend build
func azure functionapp publish your-function-app-name
```

## 🎯 設計原則

### Container/Presentation パターン

- ビジネスロジックと UI の分離
- 再利用可能なコンポーネント設計

### 段階的状態管理

1. **ローカル状態** - useState
2. **グローバル状態** - Zustand
3. **マイクロフロントエンド** - 将来の拡張用

### 機能ベースアーキテクチャ

- 機能ごとのディレクトリ分割
- 独立性と保守性の向上

## 📚 ドキュメント

### プロジェクト設定・戦略

- [`.github/LIBRARY_UPGRADE_STRATEGY.md`](.github/LIBRARY_UPGRADE_STRATEGY.md) - ライブラリアップグレード戦略
- [`.github/scalable-project-config.md`](.github/scalable-project-config.md) - スケーラビリティ戦略
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) - GitHub Copilot使用指針

### アップグレード履歴

- [`.github/changelogs/`](.github/changelogs/README.md) - 重要な変更履歴
  - `CHANGELOG_20250605_001_Node_js_Version_Upgrade.md` - Node.js v22.16.0 LTSアップグレード
  - `CHANGELOG_20250605_002_Library_Upgrade_Strategy_Completion.md` - ライブラリアップグレード完了

### 開発環境設定

- [`VS_CODE_TEAM_GUIDE.md`](VS_CODE_TEAM_GUIDE.md) - VS Codeチーム開発ガイド
- [`VSCODE_SETUP.md`](VSCODE_SETUP.md) - VS Code環境セットアップ

## 🤝 コントリビューション

1. Feature ブランチを作成
2. 変更を実装
3. テストを追加/更新
4. プルリクエストを作成

## 📄 ライセンス

MIT License

## 📞 サポート

問題や質問がある場合は、Issues を作成してください。
