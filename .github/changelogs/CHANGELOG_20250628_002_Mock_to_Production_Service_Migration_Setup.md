# モック解除とサービス接続設定ガイド

**日付**: 2025年6月28日  
**種類**: 開発環境構成変更・サービス統合  
**影響範囲**: バックエンドサービス、データベース接続、AI統合

## 設定完了項目

### 1. 環境変数設定

#### バックエンド環境変数 (`backend/.env.development`)
```bash
# モック切替フラグ
USE_MOCK_AI_SERVICE=false          # Azure OpenAI 使用
USE_MOCK_DATABASE=false            # Supabase 使用

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
```

#### フロントエンド環境変数 (`frontend/.env.development`)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### 2. サービス実装完了

#### Azure OpenAI サービス
- ✅ `backend/src/services/AIService.ts` - Azure OpenAI v4対応実装
- ✅ `AIServiceFactory` - 環境変数ベースの切替ロジック
- ✅ `openai@^4.0.0` パッケージ追加

#### データベースサービス
- ✅ `backend/src/services/DatabaseServiceFactory.ts` - Supabase切替ロジック
- ✅ `SupabaseBaseService` - 抽象基底クラス
- ✅ モック/実サービス切替機能

## 次のステップ

### 1. 実際の接続設定
```bash
# 実際の環境変数値を設定
cp backend/.env.development backend/.env.local
cp frontend/.env.development frontend/.env.local

# 実際の値を.env.localに設定
# - Supabase プロジェクトURL・キー
# - Azure OpenAI エンドポイント・キー
```

### 2. サービス完全切替
```bash
# 環境変数でモックを無効化
USE_MOCK_AI_SERVICE=false
USE_MOCK_DATABASE=false
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 3. テスト実行
```bash
# バックエンドテスト
yarn workspace @mochiport/backend test

# フロントエンドテスト  
yarn workspace @mochiport/frontend test

# 統合テスト
yarn test
```

## 技術詳細

### AIサービス統合
- **OpenAI v4 API**: 最新のChat Completions API使用
- **Azure OpenAI対応**: 企業向けエンドポイント対応
- **自動フォールバック**: 設定不備時はモックサービス継続使用
- **エラーハンドリング**: 接続失敗時の適切なエラー応答

### データベース統合  
- **Supabase Client**: 環境変数ベース接続設定
- **リアルタイム機能**: Realtime subscriptions対応
- **型安全性**: TypeScript完全対応
- **クエリビルダー**: ヘルパーメソッドによる安全なクエリ実行

### セキュリティ考慮事項
- **環境変数管理**: `.env.local`での機密情報管理
- **API キー保護**: Service Role キーの適切な権限設定
- **エラー情報制限**: 本番環境での機密情報漏洩防止

## 課題と制限事項

### 現在の制限
1. **ConversationService**: 完全なモック/実サービス切替実装が未完了
2. **DraftService/ReminderService**: 同様の切替機能未実装
3. **フロントエンド統合**: バックエンドAPI変更への対応が必要

### 解決予定
1. サービス層の完全リファクタリング
2. 統合テストスイートの拡充
3. エラーハンドリングの標準化

## 関連ドキュメント
- [Supabase Documentation](https://supabase.com/docs)
- [Azure OpenAI Documentation](https://docs.microsoft.com/azure/cognitive-services/openai/)
- [OpenAI Node.js Library v4](https://github.com/openai/openai-node)

---
**作業者**: GitHub Copilot  
**レビュー状況**: 設定完了・テスト待機中  
**次回作業**: サービス切替完全実装
