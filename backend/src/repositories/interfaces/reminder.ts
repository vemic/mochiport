import type { Reminder, CreateReminderData, UpdateReminderData, ReminderFilters, ReminderStatus } from '@mochiport/shared'
import type { BaseRepository } from './base.js';

export interface ReminderRepository extends BaseRepository<Reminder, CreateReminderData, UpdateReminderData, ReminderFilters> {
  findByStatus(status: ReminderStatus[]): Promise<Reminder[]>
  findByConversation(conversationId: string): Promise<Reminder[]>
  findUpcoming(limit?: number): Promise<Reminder[]>
  findOverdue(): Promise<Reminder[]>
  search(query: string, filters?: Partial<ReminderFilters>): Promise<Reminder[]>
  markAsCompleted(id: string): Promise<Reminder>
  snooze(id: string, minutes: number): Promise<Reminder>
}