-- PostgreSQL データベース初期化スクリプト
-- mochiport プロジェクト用

-- データベース作成（必要に応じて）
-- CREATE DATABASE mochiport_dev;

-- 会話テーブル
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 下書きテーブル
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'note',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- リマインダーテーブル
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'reminder',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- トリガー関数：updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
    BEFORE UPDATE ON drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ挿入（開発用）
INSERT INTO conversations (id, title, status, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'AI との最初の対話', 'active', '{"tags": ["getting-started"], "priority": "medium"}'),
('550e8400-e29b-41d4-a716-446655440002', '技術相談', 'active', '{"tags": ["technical", "typescript"], "priority": "high"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO messages (id, conversation_id, content, role, timestamp) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'こんにちは！', 'user', '2024-01-01 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'こんにちは！何かお手伝いできることはありますか？', 'assistant', '2024-01-01 10:00:30+00'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'TypeScriptについて教えてください', 'user', '2024-01-01 11:00:00+00'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'TypeScriptはJavaScriptに静的型付けを追加したプログラミング言語です。', 'assistant', '2024-01-01 11:00:30+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drafts (id, conversation_id, title, content, type, status, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', '企画書草案', '新しいプロジェクトの企画書です...', 'note', 'draft', '{"priority": "high"}'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440002', '技術仕様書', 'システムの技術仕様について...', 'note', 'draft', '{"priority": "medium"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reminders (id, title, description, conversation_id, scheduled_at, type, status, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440041', '会話の続きを確認', '重要な会話の続きを確認してください', '550e8400-e29b-41d4-a716-446655440001', '2024-01-02 10:00:00+00', 'task', 'pending', '{"priority": "medium"}'),
('550e8400-e29b-41d4-a716-446655440042', 'TypeScript学習継続', 'TypeScriptの学習を継続しましょう', '550e8400-e29b-41d4-a716-446655440002', '2024-01-03 10:00:00+00', 'reminder', 'pending', '{"priority": "high"}')
ON CONFLICT (id) DO NOTHING;
