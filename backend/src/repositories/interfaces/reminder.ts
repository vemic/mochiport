import { IBaseRepository } from "./base"
import { IReminder, GetRemindersFilters, PaginatedResponse } from "@ai-chat/shared"

export interface IReminderRepository extends IBaseRepository<IReminder> {
  /**
   * Find reminders with filters and pagination
   */
  findMany(filters: GetRemindersFilters): Promise<PaginatedResponse<IReminder>>

  /**
   * Find upcoming reminders within a time range
   */
  findUpcoming(startDate: Date, endDate: Date): Promise<IReminder[]>

  /**
   * Find overdue reminders
   */
  findOverdue(currentDate: Date): Promise<IReminder[]>

  /**
   * Find reminders by conversation ID
   */
  findByConversationId(conversationId: string): Promise<IReminder[]>

  /**
   * Find reminders by status
   */
  findByStatus(status: IReminder['status']): Promise<IReminder[]>

  /**
   * Find reminders by priority
   */
  findByPriority(priority: IReminder['priority']): Promise<IReminder[]>

  /**
   * Find reminders by type
   */
  findByType(type: IReminder['type']): Promise<IReminder[]>

  /**
   * Count total reminders
   */
  count(filters?: Partial<GetRemindersFilters>): Promise<number>
}
