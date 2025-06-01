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

export type ReminderType = 'follow_up' | 'deadline' | 'meeting' | 'custom';

export type ReminderPriority = 'low' | 'medium' | 'high';

export interface ReminderMetadata {
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  notificationSettings?: NotificationSettings;
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
  metadata?: Partial<ReminderMetadata>;
}
