// API関連の型定義
import type { ConversationStatus } from './conversation.js';
import type { ReminderStatus, ReminderType } from './reminder.js';
import type { DraftStatus, DraftType } from './draft.js';

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
  offset?: number;
}

// フィルタリング用の型
// ConversationFilters は conversation.ts で定義されています

// Note: Extended filter interfaces are defined in their respective type files
// and re-exported below for consistency

// バリデーション結果の型
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// re-export from other type files
export * from './conversation.js';
export * from './reminder.js';
export * from './draft.js';
