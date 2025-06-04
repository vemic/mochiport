// API関連の定数
export const API_ENDPOINTS = {
  CONVERSATIONS: '/api/conversations',
  REMINDERS: '/api/reminders',
  DRAFTS: '/api/drafts',
  HEALTH: '/api/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// ページネーション関連の定数
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// 検索関連の定数
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_MS: 300,
} as const;

// リマインダー関連の定数
export const REMINDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SNOOZED: 'snoozed',
  OVERDUE: 'overdue',
} as const;

export const REMINDER_TYPE = {
  FOLLOW_UP: 'follow_up',
  DEADLINE: 'deadline',
  MEETING: 'meeting',
  CUSTOM: 'custom',
} as const;

export const REMINDER_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
