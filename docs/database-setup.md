# mochiport データベース設定ガイド

## 📊 データアーキテクチャの改善

### 問題の概要

現在のモックデータには以下の問題があります：

- AI サービス層にデータベース的情報（会話履歴、下書き、リマインダー）が含まれている
- 責務の分離ができていない（AI処理 vs データ永続化）

### 解決策：適切なデータベースの導入

## 🎯 推奨データベース選択肢

### 1. MongoDB (最推奨) 🥇

**理由:**

- チャットメッセージの階層構造に最適
- JSON ライクなドキュメント構造
- スキーマレスで開発が柔軟
- 開発環境で軽量

**セットアップ:**

```bash
# Docker を使用（推奨）
docker run -d -p 27017:27017 --name mochiport-mongo mongo:latest

# 依存関係の追加
cd backend
yarn add mongodb @types/mongodb
```

**環境変数設定:**

```env
# backend/.env.development
MONGODB_URL=mongodb://localhost:27017
DB_NAME=mochiport_dev
DATABASE_TYPE=mongodb
```

### 2. SQLite (軽量選択肢) 🥈

**理由:**

- ファイルベースで設定不要
- 開発初期に最適
- SQLの学習にも良い

**セットアップ:**

```bash
cd backend
yarn add sqlite3 @types/sqlite3
```

**環境変数設定:**

```env
# backend/.env.development
DATABASE_TYPE=sqlite
SQLITE_PATH=./data/mochiport.db
```

### 3. Supabase (本格的) 🥉

**理由:**

- PostgreSQL + リアルタイム機能
- 認証機能も内蔵
- プロダクション準備完了

**セットアップ:**

```bash
cd backend
yarn add @supabase/supabase-js
```

## 🏗️ 実装プラン

### Phase 1: データベース基盤の構築

1. ✅ DatabaseManager の実装
2. ✅ MongoConversationRepository の作成
3. 🔄 AIサービスからデータ分離
4. 🔄 Repository パターンの完全実装

### Phase 2: データ移行

1. モックデータをデータベースに移行
2. シードスクリプトの作成
3. 開発環境での動作確認

### Phase 3: 最適化

1. インデックスの設定
2. クエリの最適化
3. キャッシュ層の追加

## 🛠️ 実装例

### データベース構造（MongoDB）

```javascript
// conversations コレクション
{
  id: "conversation_1",
  title: "AI との対話",
  messages: [
    {
      id: "msg_1",
      content: "こんにちは",
      role: "user",
      timestamp: "2024-01-01T10:00:00Z"
    }
  ],
  status: "active",
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:00:00Z"
}

// reminders コレクション
{
  id: "reminder_1",
  title: "会話の続き",
  conversationId: "conversation_1",
  scheduledAt: "2024-01-02T10:00:00Z",
  status: "pending"
}

// drafts コレクション
{
  id: "draft_1",
  title: "企画書草案",
  content: "...",
  status: "draft"
}
```

## 🚀 次のステップ

1. **データベース選択**: MongoDB を推奨しますが、お好みに応じて選択
2. **環境設定**: Docker または直接インストール
3. **データ移行**: 現在のモックデータを適切なコレクション/テーブルに移行
4. **AI サービス純化**: AI 処理のみに特化

## ❓ 質問事項

どのデータベースを選択されますか？

- MongoDB（チャット特化、推奨）
- SQLite（軽量、学習向け）
- Supabase（本格運用向け）
- その他のご希望

選択いただければ、具体的な実装を進めさせていただきます！
