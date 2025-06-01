import { z } from 'zod';

// 会話関連のバリデーションスキーマ
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  messages: z.array(z.object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    content: z.string().min(1),
    role: z.enum(['user', 'assistant', 'system']),
    timestamp: z.date(),
    metadata: z.record(z.unknown()).optional(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(['active', 'archived', 'deleted']),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(200),
  initialMessage: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1),
  role: z.enum(['user', 'assistant', 'system']),
  metadata: z.record(z.unknown()).optional(),
});

// リマインダー関連のバリデーションスキーマ
export const ReminderSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  scheduledAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(['pending', 'completed', 'cancelled', 'overdue']),
  type: z.enum(['follow_up', 'deadline', 'meeting', 'custom']),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateReminderSchema = z.object({
  conversationId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  scheduledAt: z.date(),
  type: z.enum(['follow_up', 'deadline', 'meeting', 'custom']),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  scheduledAt: z.date().optional(),
  status: z.enum(['pending', 'completed', 'cancelled', 'overdue']).optional(),
  type: z.enum(['follow_up', 'deadline', 'meeting', 'custom']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ドラフト関連のバリデーションスキーマ
export const DraftSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']),
  type: z.enum(['response', 'summary', 'analysis', 'note', 'template']),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateDraftSchema = z.object({
  conversationId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['response', 'summary', 'analysis', 'note', 'template']),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateDraftSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']).optional(),
  type: z.enum(['response', 'summary', 'analysis', 'note', 'template']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const BulkDraftOperationSchema = z.object({
  draftIds: z.array(z.string().uuid()).min(1),
  operation: z.enum(['approve', 'publish', 'archive', 'delete']),
  metadata: z.record(z.unknown()).optional(),
});

// フィルタリング用のスキーマ
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const ConversationFiltersSchema = PaginationParamsSchema.extend({
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  search: z.string().min(2).max(100).optional(),
});

export const ReminderFiltersSchema = PaginationParamsSchema.extend({
  status: z.enum(['pending', 'completed', 'cancelled', 'overdue']).optional(),
  type: z.enum(['follow_up', 'deadline', 'meeting', 'custom']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  conversationId: z.string().uuid().optional(),
});

export const DraftFiltersSchema = PaginationParamsSchema.extend({
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']).optional(),
  type: z.enum(['response', 'summary', 'analysis', 'note', 'template']).optional(),
  conversationId: z.string().uuid().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
