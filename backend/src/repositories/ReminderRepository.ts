import { IReminderRepository } from "./interfaces/reminder"
import { IReminder, GetRemindersFilters, PaginatedResponse } from "@ai-chat/shared"

export class ReminderRepository implements IReminderRepository {
  // In-memory storage for development - replace with actual database
  private reminders: IReminder[] = []
  private nextId = 1

  async findById(id: string): Promise<IReminder | null> {
    return this.reminders.find(reminder => reminder.id === id) || null
  }

  async findMany(filters: GetRemindersFilters): Promise<PaginatedResponse<IReminder>> {
    let filteredReminders = [...this.reminders]

    // Apply status filter
    if (filters.status) {
      filteredReminders = filteredReminders.filter(reminder => reminder.status === filters.status)
    }

    // Apply priority filter
    if (filters.priority) {
      filteredReminders = filteredReminders.filter(reminder => reminder.priority === filters.priority)
    }

    // Apply type filter
    if (filters.type) {
      filteredReminders = filteredReminders.filter(reminder => reminder.type === filters.type)
    }

    // Apply conversation filter
    if (filters.conversationId) {
      filteredReminders = filteredReminders.filter(reminder => reminder.conversationId === filters.conversationId)
    }

    // Sort by due date (ascending by default)
    filteredReminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const offset = (page - 1) * limit
    
    const paginatedReminders = filteredReminders.slice(offset, offset + limit)
    const total = filteredReminders.length
    const totalPages = Math.ceil(total / limit)

    return {
      data: paginatedReminders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  async create(data: Omit<IReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IReminder> {
    const now = new Date()
    const newReminder: IReminder = {
      ...data,
      id: `reminder_${this.nextId++}`,
      createdAt: now,
      updatedAt: now
    }

    this.reminders.push(newReminder)
    return newReminder
  }

  async update(id: string, data: Partial<IReminder>): Promise<IReminder> {
    const index = this.reminders.findIndex(reminder => reminder.id === id)
    if (index === -1) {
      throw new Error(`Reminder with ID ${id} not found`)
    }

    const updatedReminder = {
      ...this.reminders[index],
      ...data,
      updatedAt: new Date()
    }

    this.reminders[index] = updatedReminder
    return updatedReminder
  }

  async delete(id: string): Promise<void> {
    const index = this.reminders.findIndex(reminder => reminder.id === id)
    if (index === -1) {
      throw new Error(`Reminder with ID ${id} not found`)
    }

    this.reminders.splice(index, 1)
  }

  async findUpcoming(startDate: Date, endDate: Date): Promise<IReminder[]> {
    return this.reminders.filter(reminder => {
      const dueDate = new Date(reminder.dueDate)
      return dueDate >= startDate && dueDate <= endDate && reminder.status === 'pending'
    })
  }

  async findOverdue(currentDate: Date): Promise<IReminder[]> {
    return this.reminders.filter(reminder => {
      const dueDate = new Date(reminder.dueDate)
      return dueDate < currentDate && reminder.status === 'pending'
    })
  }

  async findByConversationId(conversationId: string): Promise<IReminder[]> {
    return this.reminders.filter(reminder => reminder.conversationId === conversationId)
  }

  async findByStatus(status: IReminder['status']): Promise<IReminder[]> {
    return this.reminders.filter(reminder => reminder.status === status)
  }

  async findByPriority(priority: IReminder['priority']): Promise<IReminder[]> {
    return this.reminders.filter(reminder => reminder.priority === priority)
  }

  async findByType(type: IReminder['type']): Promise<IReminder[]> {
    return this.reminders.filter(reminder => reminder.type === type)
  }

  async count(filters?: Partial<GetRemindersFilters>): Promise<number> {
    if (!filters) {
      return this.reminders.length
    }

    let filteredReminders = [...this.reminders]

    if (filters.status) {
      filteredReminders = filteredReminders.filter(reminder => reminder.status === filters.status)
    }

    if (filters.priority) {
      filteredReminders = filteredReminders.filter(reminder => reminder.priority === filters.priority)
    }

    if (filters.type) {
      filteredReminders = filteredReminders.filter(reminder => reminder.type === filters.type)
    }

    if (filters.conversationId) {
      filteredReminders = filteredReminders.filter(reminder => reminder.conversationId === filters.conversationId)
    }

    return filteredReminders.length
  }
}
