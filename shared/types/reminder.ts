// リマインダー関連の型定義
export interface Reminder {
  id: string;
  conversationId: string;
  title: string;
  description?: string;
  dueDate: Date;
  scheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  status: ReminderStatus;
  type: ReminderType;
  priority: ReminderPriority;
  metadata?: ReminderMetadata;
}

export type ReminderStatus = 'pending' | 'completed' | 'cancelled' | 'overdue' | 'snoozed';

export type ReminderType = 'follow_up' | 'deadline' | 'meeting' | 'custom' | 'task' | 'general';

export type ReminderPriority = 'low' | 'medium' | 'high';

export interface ReminderMetadata {
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  notificationSettings?: NotificationSettings;
  source?: string;
  estimatedDuration?: number;
  recurring?: string;
  attendees?: string[];
  completedBy?: string;
}

export interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  advanceNotice?: number; // minutes before scheduled time
}

// リマインダー作成・更新用の型
export interface CreateReminderData {
  conversationId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  type: ReminderType;
  metadata?: Partial<ReminderMetadata>;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  scheduledAt?: Date;
  status?: ReminderStatus;
  type?: ReminderType;
  snoozeUntil?: string;
  metadata?: Partial<ReminderMetadata>;
}

// リマインダーフィルター用の型
export interface ReminderFilters {
  page?: number;
  limit?: number;
  offset?: number;
  status?: ReminderStatus | ReminderStatus[];
  type?: ReminderType | ReminderType[];
  priority?: ReminderPriority | ReminderPriority[];
  conversationId?: string;
  title?: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
}
