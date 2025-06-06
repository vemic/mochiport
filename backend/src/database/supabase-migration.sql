-- Supabase用データベーススキーマ更新
-- ユーザー認証対応とSupabase固有の機能を追加

-- Row Level Security (RLS) を有効にする前に、既存のテーブルを更新
-- user_id カラムを追加

-- 会話テーブルの更新
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- メッセージテーブルの更新  
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 下書きテーブルの更新
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- リマインダーテーブルの更新
ALTER TABLE reminders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Row Level Security (RLS) を有効化
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS ポリシーを作成（ユーザーは自分のデータのみアクセス可能）

-- 会話テーブルのポリシー
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- メッセージテーブルのポリシー
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- 下書きテーブルのポリシー
CREATE POLICY "Users can view own drafts" ON drafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON drafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON drafts
    FOR DELETE USING (auth.uid() = user_id);

-- リマインダーテーブルのポリシー
CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

-- ユーザーIDインデックス追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);

-- 複合インデックス（ユーザーIDと日付による検索の最適化）
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_conversation ON messages(user_id, conversation_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_drafts_user_updated ON drafts(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_scheduled ON reminders(user_id, scheduled_at);

-- AI応答生成のためのストアドファンシション
CREATE OR REPLACE FUNCTION get_conversation_context(
  p_conversation_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  message_id UUID,
  content TEXT,
  role VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as message_id,
    m.content,
    m.role,
    m.timestamp
  FROM messages m
  WHERE m.conversation_id = p_conversation_id 
    AND m.user_id = p_user_id
  ORDER BY m.timestamp ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 会話作成時に最初のメッセージを自動的に関連付ける関数
CREATE OR REPLACE FUNCTION create_conversation_with_message(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_initial_message TEXT DEFAULT NULL,
  p_message_role VARCHAR(50) DEFAULT 'user'
)
RETURNS TABLE (
  conversation_id UUID,
  message_id UUID
) AS $$
DECLARE
  v_conversation_id UUID;
  v_message_id UUID;
BEGIN
  -- 会話を作成
  INSERT INTO conversations (user_id, title)
  VALUES (p_user_id, p_title)
  RETURNING id INTO v_conversation_id;
  
  -- 初期メッセージがある場合は追加
  IF p_initial_message IS NOT NULL THEN
    INSERT INTO messages (user_id, conversation_id, content, role)
    VALUES (p_user_id, v_conversation_id, p_initial_message, p_message_role)
    RETURNING id INTO v_message_id;
  END IF;
  
  RETURN QUERY SELECT v_conversation_id, v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
