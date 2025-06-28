# AI チャット管理アプリケーション

拡張性重視のモダンな AI チャット管理システムです。Turborepo monorepo 構成で、フロントエンドに Next.js 15 + React 19、バックエンドに Node.js Express サーバーを採用しています。

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
├── backend/           # Node.js Express サーバー
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
- TypeScript 5.7.2
- Tailwind CSS 4.1.8
- Zustand (状態管理)
- React Query (TanStack Query) (データフェッチング)
- Radix UI (UI コンポーネント)
- React Hook Form (フォーム管理)

**バックエンド:**

- Node.js Express サーバー
- TypeScript
- Supabase (データベース)
- Azure OpenAI (AI統合)
- Zod (バリデーション)

**開発ツール:**

- Turborepo (monorepo 管理)
- ESLint 9 + Prettier
- Jest (テスト)
- TypeScript 5.7.2
- Concurrently (並行プロセス実行)
- Nodemon (開発時のホットリロード)

## 🛠️ セットアップ

### 前提条件

- Node.js 22.16.0+ (LTS推奨)
- Yarn 1.22+

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
├── routes/              # Express ルーター
│   ├── chat.ts         # チャット関連 API
│   ├── conversation.ts # 会話関連 API
│   ├── reminder.ts     # リマインダー関連 API
│   └── draft.ts        # ドラフト関連 API
├── services/           # ビジネスロジック
├── repositories/       # データアクセス層
├── middleware/         # Express ミドルウェア
├── config/            # 設定ファイル
├── utils/             # ユーティリティ
├── data/              # モックデータ
└── server.ts          # Express サーバーエントリポイント
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
NEXT_PUBLIC_API_URL=http://localhost:7071
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_REALTIME=true
```

**バックエンド (.env.development):**

```env
PORT=7071
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Supabase Configuration
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint-here
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_MODEL_NAME=gpt-4

# モック切替フラグ
USE_MOCK_AI_SERVICE=false
USE_MOCK_DATABASE=false

# Optional Settings
JWT_SECRET=development-secret-key
REDIS_CONNECTION_STRING=mock://development
LOG_LEVEL=debug
```

### Supabase セットアップ

1. **Supabaseプロジェクトの作成**

   - https://supabase.com でアカウント作成
   - 新しいプロジェクトを作成

2. **データベーステーブルの作成**

   ```sql
   -- conversations テーブル
   CREATE TABLE conversations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT NOT NULL,
     title TEXT NOT NULL,
     status TEXT DEFAULT 'active',
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- messages テーブル
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     conversation_id UUID REFERENCES conversations(id),
     user_id TEXT NOT NULL,
     content TEXT NOT NULL,
     role TEXT NOT NULL,
     timestamp TIMESTAMPTZ DEFAULT NOW(),
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- drafts テーブル
   CREATE TABLE drafts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT NOT NULL,
     title TEXT NOT NULL,
     content TEXT,
     type TEXT DEFAULT 'general',
     status TEXT DEFAULT 'draft',
     conversation_id UUID REFERENCES conversations(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- reminders テーブル
   CREATE TABLE reminders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     due_date TIMESTAMPTZ NOT NULL,
     status TEXT DEFAULT 'pending',
     priority TEXT DEFAULT 'medium',
     type TEXT DEFAULT 'general',
     conversation_id UUID REFERENCES conversations(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **環境変数の設定**

   - Supabaseプロジェクトの設定からAPI KeysとProject URLを取得
   - `.env.development` ファイルにコピー

4. **接続テスト**
   ```bash
   # Supabase接続テストスクリプトを実行
   yarn workspace @mochiport/backend exec tsx src/scripts/test-supabase-connection.ts
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

### バックエンド (Node.js Express)

```bash
# Express サーバーをローカルで起動
yarn workspace backend build
yarn workspace backend start
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
