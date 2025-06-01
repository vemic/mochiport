// API関連の型定義
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// フィルタリング用の型
export interface ConversationFilters extends PaginationParams {
  status?: ConversationStatus;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  category?: string;
  search?: string;
}

export interface ReminderFilters extends PaginationParams {
  status?: ReminderStatus;
  type?: ReminderType;
  dateFrom?: string;
  dateTo?: string;
  conversationId?: string;
}

export interface DraftFilters extends PaginationParams {
  status?: DraftStatus;
  type?: DraftType;
  conversationId?: string;
  author?: string;
  tags?: string[];
}

// バリデーション結果の型
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

// re-export from other type files
export * from './conversation';
export * from './reminder';
export * from './draft';
