import type { Reminder, CreateReminderData, UpdateReminderData, ReminderFilters, PaginatedResponse } from '@ai-chat/shared'
import type { ReminderRepository as IReminderRepository } from './interfaces/reminder'
import { mockReminders } from '../data/mock-data'

export class ReminderRepository implements IReminderRepository {
  private reminders: Reminder[] = [...mockReminders]

  async findById(id: string): Promise<Reminder | null> {
    return this.reminders.find(reminder => reminder.id === id) || null
  }

  async findMany(filters: ReminderFilters): Promise<PaginatedResponse<Reminder>> {
    let filteredReminders = [...this.reminders]

    // Apply filters
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      filteredReminders = filteredReminders.filter(reminder => statuses.includes(reminder.status))
    }

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type]
      filteredReminders = filteredReminders.filter(reminder => types.includes(reminder.type))
    }

    if (filters.conversationId) {
      filteredReminders = filteredReminders.filter(reminder => reminder.conversationId === filters.conversationId)
    }

    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority]
      filteredReminders = filteredReminders.filter(reminder => priorities.includes(reminder.priority))
    }

    if (filters.title) {
      const titleLower = filters.title.toLowerCase()
      filteredReminders = filteredReminders.filter(reminder =>
        reminder.title.toLowerCase().includes(titleLower)
      )
    }

    if (filters.description) {
      const descriptionLower = filters.description.toLowerCase()
      filteredReminders = filteredReminders.filter(reminder =>
        reminder.description?.toLowerCase().includes(descriptionLower)
      )
    }

    if (filters.dateFrom) {
      filteredReminders = filteredReminders.filter(reminder =>
        new Date(reminder.dueDate) >= new Date(filters.dateFrom!)
      )
    }

    if (filters.dateTo) {
      filteredReminders = filteredReminders.filter(reminder =>
        new Date(reminder.dueDate) <= new Date(filters.dateTo!)
      )
    }

    if (filters.createdAfter) {
      filteredReminders = filteredReminders.filter(reminder =>
        new Date(reminder.createdAt) >= filters.createdAfter!
      )
    }

    if (filters.createdBefore) {
      filteredReminders = filteredReminders.filter(reminder =>
        new Date(reminder.createdAt) <= filters.createdBefore!
      )
    }

    if (filters.scheduledAfter) {
      filteredReminders = filteredReminders.filter(reminder =>
        new Date(reminder.scheduledAt) >= filters.scheduledAfter!
      )
    }

    if (filters.scheduledBefore) {
      filteredReminders = filteredReminders.filter(reminder =>
        new Date(reminder.scheduledAt) <= filters.scheduledBefore!
      )
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReminders = filteredReminders.slice(startIndex, endIndex)

    const total = filteredReminders.length
    const totalPages = Math.ceil(total / limit)

    return {
      data: paginatedReminders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      },
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  async create(data: CreateReminderData): Promise<Reminder> {
    const newReminder: Reminder = {
      id: `reminder_${Date.now()}`,
      ...data,
      dueDate: data.scheduledAt,
      status: 'pending',
      priority: data.metadata?.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.reminders.push(newReminder)
    return newReminder
  }

  async update(id: string, data: UpdateReminderData): Promise<Reminder | null> {
    const index = this.reminders.findIndex(reminder => reminder.id === id)
    if (index === -1) return null

    this.reminders[index] = {
      ...this.reminders[index],
      ...data,
      updatedAt: new Date()
    }

    return this.reminders[index]
  }
  async delete(id: string): Promise<void> {
    const index = this.reminders.findIndex(reminder => reminder.id === id)
    if (index === -1) {
      throw new Error(`Reminder with id ${id} not found`)
    }
    this.reminders.splice(index, 1)
  }

  async count(filters?: Partial<ReminderFilters>): Promise<number> {
    if (!filters) return this.reminders.length

    const result = await this.findMany(filters as ReminderFilters)
    return result.pagination.total
  }

  async findByStatus(status: string[]): Promise<Reminder[]> {
    return this.reminders.filter(reminder => status.includes(reminder.status))
  }

  async findByConversation(conversationId: string): Promise<Reminder[]> {
    return this.reminders.filter(reminder => reminder.conversationId === conversationId)
  }

  async findUpcoming(limit: number = 10): Promise<Reminder[]> {
    const now = new Date()
    return this.reminders
      .filter(reminder => reminder.status === 'pending' && new Date(reminder.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, limit)
  }

  async findOverdue(): Promise<Reminder[]> {
    const now = new Date()
    return this.reminders
      .filter(reminder => reminder.status === 'pending' && new Date(reminder.dueDate) < now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  async search(query: string, filters?: Partial<ReminderFilters>): Promise<Reminder[]> {
    const queryLower = query.toLowerCase()
    let results = this.reminders.filter(reminder =>
      reminder.title.toLowerCase().includes(queryLower) ||
      reminder.description?.toLowerCase().includes(queryLower)
    )

    if (filters) {
      const fullFilters = { ...filters, limit: undefined, page: undefined } as ReminderFilters
      const paginatedResult = await this.findMany(fullFilters)
      const filteredIds = new Set(paginatedResult.data.map(r => r.id))
      results = results.filter(reminder => filteredIds.has(reminder.id))
    }

    return results
  }

  async markAsCompleted(id: string): Promise<Reminder> {
    const reminder = await this.update(id, {
      status: 'completed',
      metadata: {
        ...this.reminders.find(r => r.id === id)?.metadata,
        completedBy: 'user_dev_123'
      }
    })

    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`)
    }

    return reminder
  }

  async snooze(id: string, minutes: number): Promise<Reminder> {
    const reminder = this.reminders.find(r => r.id === id)
    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`)
    }

    const newScheduledAt = new Date(reminder.scheduledAt.getTime() + minutes * 60 * 1000)
    const updatedReminder = await this.update(id, {
      scheduledAt: newScheduledAt,
      status: 'snoozed'
    })

    if (!updatedReminder) {
      throw new Error(`Failed to snooze reminder with id ${id}`)
    }

    return updatedReminder
  }
}