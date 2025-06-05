// API Client exports
export { httpClient, ApiError } from './client';
export { conversationApi } from './conversation';
export { reminderApi } from './reminder';
export { draftApi } from './draft';

// Re-export shared types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError as ApiErrorType
} from '@ai-chat/shared';
