// データベースモデルの型定義
// Supabase PostgreSQL スキーマに対応

export interface DatabaseConversation {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  metadata?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface DatabaseDraft {
  id: string;
  user_id: string;
  conversation_id?: string;
  title: string;
  content: string;
  type: 'note' | 'task' | 'idea' | 'other';
  status: 'draft' | 'published' | 'archived';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseReminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  conversation_id?: string;
  scheduled_at: string;
  type: 'reminder' | 'task' | 'follow_up';
  status: 'pending' | 'completed' | 'cancelled' | 'snoozed';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ビジネスロジック用の型（APIレスポンス用）
export interface ConversationWithMessages {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  metadata?: Record<string, any>;
  messages: DatabaseMessage[];
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  lastMessage?: {
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: string;
  };
  created_at: string;
  updated_at: string;
}

// AI サービス統合用の型
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIConversationContext {
  conversationId: string;
  messages: AIMessage[];
  metadata?: Record<string, any>;
}

export interface AIServiceResponse {
  content: string;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  metadata?: Record<string, any>;
}

// Database operation result types
export interface DatabaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ConversationFilters {
  status?: 'active' | 'archived' | 'deleted';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface MessageFilters {
  conversationId?: string;
  role?: 'user' | 'assistant' | 'system';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface DraftFilters {
  type?: 'note' | 'task' | 'idea' | 'other';
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReminderFilters {
  type?: 'reminder' | 'task' | 'follow_up';
  status?: 'pending' | 'completed' | 'cancelled' | 'snoozed';
  dueStart?: string;
  dueEnd?: string;
  search?: string;
}

// Repository layer interfaces
export interface BaseRepository<T, TFilters = any> {
  findById(id: string, userId: string): Promise<DatabaseOperationResult<T>>;
  findMany(userId: string, filters?: TFilters, pagination?: PaginationParams): Promise<DatabaseOperationResult<T[]>>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<DatabaseOperationResult<T>>;
  update(id: string, data: Partial<T>, userId: string): Promise<DatabaseOperationResult<T>>;
  delete(id: string, userId: string): Promise<DatabaseOperationResult<boolean>>;
  count(userId: string, filters?: TFilters): Promise<DatabaseOperationResult<number>>;
}

// AI Service interfaces
export interface AIService {
  generateResponse(context: AIConversationContext): Promise<AIServiceResponse>;
  validateConnection(): Promise<boolean>;
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

// Service layer interfaces
export interface ConversationService {
  getConversations(userId: string, filters?: ConversationFilters, pagination?: PaginationParams): Promise<ConversationSummary[]>;
  getConversation(id: string, userId: string): Promise<ConversationWithMessages | null>;
  createConversation(data: { title: string; initialMessage?: string }, userId: string): Promise<ConversationWithMessages>;
  updateConversation(id: string, data: { title?: string }, userId: string): Promise<ConversationWithMessages | null>;
  deleteConversation(id: string, userId: string): Promise<boolean>;
  addMessage(conversationId: string, content: string, role: 'user' | 'assistant', userId: string): Promise<DatabaseMessage>;
  generateAIResponse(conversationId: string, userId: string): Promise<DatabaseMessage>;
}

export interface DraftService {
  getDrafts(userId: string, filters?: DraftFilters, pagination?: PaginationParams): Promise<DatabaseDraft[]>;
  getDraft(id: string, userId: string): Promise<DatabaseDraft | null>;
  createDraft(data: Omit<DatabaseDraft, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<DatabaseDraft>;
  updateDraft(id: string, data: Partial<DatabaseDraft>, userId: string): Promise<DatabaseDraft | null>;
  deleteDraft(id: string, userId: string): Promise<boolean>;
  publishDraft(id: string, userId: string): Promise<ConversationWithMessages | null>;
}

export interface ReminderService {
  getReminders(userId: string, filters?: ReminderFilters, pagination?: PaginationParams): Promise<DatabaseReminder[]>;
  getReminder(id: string, userId: string): Promise<DatabaseReminder | null>;
  createReminder(data: Omit<DatabaseReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<DatabaseReminder>;
  updateReminder(id: string, data: Partial<DatabaseReminder>, userId: string): Promise<DatabaseReminder | null>;
  deleteReminder(id: string, userId: string): Promise<boolean>;
  markCompleted(id: string, userId: string): Promise<DatabaseReminder | null>;
  snoozeReminder(id: string, newDate: string, userId: string): Promise<DatabaseReminder | null>;
}
