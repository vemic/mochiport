import type { 
  Reminder, 
  CreateReminderData, 
  UpdateReminderData, 
  ReminderFilters, 
  PaginatedResponse,
  ValidationError as SharedValidationError,
  ReminderStatus
} from '@mochiport/shared'
import type { ReminderRepository as IReminderRepository } from '../repositories/interfaces/reminder'
import { ReminderRepository } from '../repositories/ReminderRepository'
import { BaseService } from './BaseService'
import { ValidationError, NotFoundError } from '../utils/errors'

export class ReminderService extends BaseService<Reminder, CreateReminderData, UpdateReminderData> {
  private reminderRepository: IReminderRepository

  constructor() {
    super()
    this.reminderRepository = new ReminderRepository()
  }

  async getReminders(filters: ReminderFilters): Promise<PaginatedResponse<Reminder>> {
    try {
      return await this.reminderRepository.findMany(filters)
    } catch (error) {
      this.handleError(error as Error, 'Failed to get reminders')
      throw error
    }
  }
  async getReminderById(id: string): Promise<Reminder> {
    try {
      const reminder = await this.reminderRepository.findById(id)
      if (!reminder) {
        throw new NotFoundError('Reminder', id)
      }
      return reminder
    } catch (error) {
      this.handleError(error as Error, `Failed to get reminder ${id}`)
      throw error
    }
  }
  async createReminder(data: CreateReminderData): Promise<Reminder> {
    try {
      // Validate due date is in the future (check both dueDate and scheduledAt)
      const dueDate = (data as any).dueDate || data.scheduledAt
      if (dueDate) {
        const dueDateObj = new Date(dueDate)
        const now = new Date()
        if (dueDateObj <= now) {
          throw new ValidationError('Due date must be in the future')
        }
      }

      // Ensure scheduledAt is set if dueDate is provided
      const createData = {
        ...data,
        scheduledAt: data.scheduledAt || (data as any).dueDate,
        status: 'pending' as const,
        priority: (data as any).priority || data.metadata?.priority || 'medium'
      }

      const validation = this.validate(createData)
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors)
      }

      return await this.reminderRepository.create(createData)
    } catch (error) {
      this.handleError(error as Error, 'Failed to create reminder')
      throw error
    }
  }
  async updateReminder(id: string, data: UpdateReminderData): Promise<Reminder> {
    try {
      const existing = await this.reminderRepository.findById(id)
      if (!existing) {
        throw new NotFoundError('Reminder', id)
      }

      const validation = this.validate(data)
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors)
      }

      const updated = await this.reminderRepository.update(id, data)
      if (!updated) {
        throw new NotFoundError('Reminder', id)
      }
      return updated
    } catch (error) {
      this.handleError(error as Error, `Failed to update reminder ${id}`)
      throw error
    }
  }
  async deleteReminder(id: string): Promise<boolean> {
    try {
      const existing = await this.reminderRepository.findById(id)
      if (!existing) {
        throw new NotFoundError('Reminder', id)
      }

      await this.reminderRepository.delete(id)
      return true
    } catch (error) {
      this.handleError(error as Error, `Failed to delete reminder ${id}`)
      throw error
    }
  }

  async markAsCompleted(id: string): Promise<Reminder> {
    try {
      const updated = await this.reminderRepository.update(id, { status: 'completed' })
      if (!updated) {
        throw new Error(`Failed to mark reminder ${id} as completed`)
      }
      return updated
    } catch (error) {
      this.handleError(error as Error, `Failed to mark reminder ${id} as completed`)
      throw error
    }
  }

  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    try {
      return await this.reminderRepository.findUpcoming(days)
    } catch (error) {
      this.handleError(error as Error, 'Failed to get upcoming reminders')
      throw error
    }
  }

  async findById(id: string): Promise<Reminder | null> {
    try {
      return await this.reminderRepository.findById(id)
    } catch (error) {
      this.handleError(error as Error, `Failed to find reminder ${id}`)
      return null
    }
  }

  async findMany(filters: ReminderFilters): Promise<PaginatedResponse<Reminder>> {
    try {
      return await this.reminderRepository.findMany(filters)
    } catch (error) {
      this.handleError(error as Error, 'Failed to find reminders')
      throw error
    }
  }

  async create(data: CreateReminderData): Promise<Reminder> {
    try {
      const validation = this.validate(data)
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors)
      }

      return await this.reminderRepository.create(data)
    } catch (error) {
      this.handleError(error as Error, 'Failed to create reminder')
      throw error
    }
  }

  async update(id: string, data: UpdateReminderData): Promise<Reminder | null> {
    try {
      const validation = this.validate(data)
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors)
      }

      return await this.reminderRepository.update(id, data)
    } catch (error) {
      this.handleError(error as Error, `Failed to update reminder ${id}`)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.reminderRepository.delete(id)
    } catch (error) {
      this.handleError(error as Error, `Failed to delete reminder ${id}`)
      throw error
    }
  }

  async snooze(id: string, snoozeUntil: Date): Promise<Reminder | null> {
    try {
      return await this.reminderRepository.update(id, {
        status: 'snoozed',
        snoozeUntil: snoozeUntil.toISOString()
      })
    } catch (error) {
      this.handleError(error as Error, `Failed to snooze reminder ${id}`)
      throw error
    }
  }

  async markCompleted(id: string): Promise<Reminder | null> {
    try {
      return await this.reminderRepository.update(id, {
        status: 'completed'
      })
    } catch (error) {
      this.handleError(error as Error, `Failed to mark reminder ${id} as completed`)
      throw error
    }
  }

  async findUpcoming(limit: number = 10): Promise<Reminder[]> {
    try {
      return await this.reminderRepository.findUpcoming(limit)
    } catch (error) {
      this.handleError(error as Error, 'Failed to find upcoming reminders')
      throw error
    }
  }

  async findOverdue(): Promise<Reminder[]> {
    try {
      return await this.reminderRepository.findOverdue()
    } catch (error) {
      this.handleError(error as Error, 'Failed to find overdue reminders')
      throw error
    }
  }

  async findByStatus(status: ReminderStatus[]): Promise<Reminder[]> {
    try {
      return await this.reminderRepository.findByStatus(status)
    } catch (error) {
      this.handleError(error as Error, `Failed to find reminders by status`)
      throw error
    }
  }  protected validate(data: CreateReminderData | UpdateReminderData): { success: boolean; errors: any[] } {
    const errors: any[] = []

    if ('title' in data && data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push({ field: 'title', message: 'Title is required', code: 'REQUIRED' })
      } else if (data.title.length > 200) {
        errors.push({ field: 'title', message: 'Title must be less than 200 characters', code: 'TOO_LONG' })
      }
    }

    if ('scheduledAt' in data && data.scheduledAt !== undefined) {
      if (!data.scheduledAt) {
        errors.push({ field: 'scheduledAt', message: 'Scheduled date is required', code: 'REQUIRED' })
      } else {
        const scheduledDate = new Date(data.scheduledAt)
        if (isNaN(scheduledDate.getTime())) {
          errors.push({ field: 'scheduledAt', message: 'Invalid scheduled date format', code: 'INVALID_FORMAT' })
        }
      }
    }

    if ('metadata' in data && data.metadata !== undefined && data.metadata.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(data.metadata.priority as string)) {
        errors.push({ field: 'priority', message: 'Invalid priority value', code: 'INVALID_VALUE' })
      }
    }

    return {
      success: errors.length === 0,
      errors
    }
  }
}