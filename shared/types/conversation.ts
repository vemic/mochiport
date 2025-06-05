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
  topic?: string;
  publishedFromDraft?: string;
  pinned?: boolean;
  favorite?: boolean;
  lastReadAt?: Date;
  unreadCount?: number;
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
  messages?: Message[];
}

export interface CreateMessageData {
  conversationId: string;
  content: string;
  role: MessageRole;
  metadata?: Partial<MessageMetadata>;
}

// フィルター用の型
export interface ConversationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ConversationStatus;
  tags?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dateFrom?: Date;
  dateTo?: Date;
  pinned?: boolean;
  favorite?: boolean;
}

// ページネーション応答の型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
