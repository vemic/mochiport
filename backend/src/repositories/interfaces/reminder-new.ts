import { BaseRepository } from "./base"
import { Reminder, ReminderFilters, PaginatedResponse, CreateReminderData, UpdateReminderData } from "@ai-chat/shared"

export interface ReminderRepository extends BaseRepository<Reminder, CreateReminderData, UpdateReminderData, ReminderFilters> {
  /**
   * Find reminders with filters and pagination
   */
  findMany(filters: ReminderFilters): Promise<PaginatedResponse<Reminder>>

  /**
   * Find upcoming reminders within a time range
   */
  findUpcoming(startDate: Date, endDate: Date): Promise<Reminder[]>

  /**
   * Find overdue reminders
   */
  findOverdue(currentDate: Date): Promise<Reminder[]>

  /**
   * Find reminders by conversation ID
   */
  findByConversationId(conversationId: string): Promise<Reminder[]>

  /**
   * Find reminders by status
   */
  findByStatus(status: Reminder['status']): Promise<Reminder[]>

  /**
   * Find reminders by priority
   */
  findByPriority(priority: Reminder['priority']): Promise<Reminder[]>

  /**
   * Find reminders by type
   */
  findByType(type: Reminder['type']): Promise<Reminder[]>

  /**
   * Count total reminders
   */
  count(filters?: Partial<ReminderFilters>): Promise<number>

  /**
   * Find reminder by ID
   */
  findById(id: string): Promise<Reminder | null>
}
