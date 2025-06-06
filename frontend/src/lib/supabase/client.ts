import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// クライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    timeout: 30000,
    // Note: eventsPerSecond is not supported in RealtimeClientOptions
  },
});

// リアルタイム接続のチャネルを作成するヘルパー
export const createRealtimeConnection = (channelName: string) => {
  return supabase.channel(channelName);
};

// 会話のリアルタイム更新をサブスクライブする
export const subscribeToConversation = (conversationId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // insert, update, deleteすべてのイベントを監視
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
};

// 会話リストのリアルタイム更新をサブスクライブする
export const subscribeToConversationList = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user-conversations-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // insert, update, deleteすべてのイベントを監視
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
};
