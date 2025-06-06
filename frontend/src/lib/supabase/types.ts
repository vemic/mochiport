import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RealtimeMessage extends Message {
  conversation_id: string;
}

export interface RealtimeConversation {
  id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  user_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export type MessageChangePayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  conversation_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}>;

export type ConversationChangePayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
  id: string;
  title: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}>;

export type RealtimeSubscription = RealtimeChannel;
