// 会話関連の型定義
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  status: ConversationStatus;
  metadata?: ConversationMetadata;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationStatus = 'active' | 'archived' | 'deleted';

export interface ConversationMetadata {
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  aiModel?: string;
}

export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  confidence?: number;
}

// 会話作成・更新用の型
export interface CreateConversationData {
  title: string;
  initialMessage?: string;
  metadata?: Partial<ConversationMetadata>;
}

export interface UpdateConversationData {
  title?: string;
  status?: ConversationStatus;
  metadata?: Partial<ConversationMetadata>;
}

export interface CreateMessageData {
  conversationId: string;
  content: string;
  role: MessageRole;
  metadata?: Partial<MessageMetadata>;
}
