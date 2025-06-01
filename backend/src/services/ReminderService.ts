import { BaseService } from "./BaseService"
import { IReminder, CreateReminderRequest, UpdateReminderRequest, GetRemindersFilters, PaginatedResponse } from "@ai-chat/shared"
import { IReminderRepository } from "../repositories/interfaces/reminder"
import { ReminderRepository } from "../repositories/ReminderRepository"
import { NotFoundError, ValidationError } from "../utils/errors"
import { addMinutes } from "date-fns"

export class ReminderService extends BaseService<IReminder> {
  private reminderRepository: IReminderRepository

  constructor() {
    super()
    this.reminderRepository = new ReminderRepository()
  }

  async getReminders(filters: GetRemindersFilters): Promise<PaginatedResponse<IReminder>> {
    try {
      return await this.reminderRepository.findMany(filters)
    } catch (error) {
      this.handleError(error, 'Failed to get reminders')
      throw error
    }
  }

  async getReminderById(id: string): Promise<IReminder> {
    try {
      const reminder = await this.reminderRepository.findById(id)
      
      if (!reminder) {
        throw new NotFoundError(`Reminder with ID ${id} not found`)
      }
      
      return reminder
    } catch (error) {
      this.handleError(error, `Failed to get reminder ${id}`)
      throw error
    }
  }

  async createReminder(data: CreateReminderRequest): Promise<IReminder> {
    try {
      // Validate due date is in the future
      if (new Date(data.dueDate) <= new Date()) {
        throw new ValidationError('Due date must be in the future')
      }

      const newReminder: Omit<IReminder, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        priority: data.priority || 'medium',
        type: data.type || 'general',
        status: 'pending',
        conversationId: data.conversationId,
        metadata: data.metadata || {}
      }

      return await this.reminderRepository.create(newReminder)
    } catch (error) {
      this.handleError(error, 'Failed to create reminder')
      throw error
    }
  }

  async updateReminder(id: string, data: UpdateReminderRequest): Promise<IReminder> {
    try {
      const existingReminder = await this.getReminderById(id)
      
      // Validate due date if provided
      if (data.dueDate && new Date(data.dueDate) <= new Date()) {
        throw new ValidationError('Due date must be in the future')
      }

      const updates: Partial<IReminder> = {
        ...data,
        updatedAt: new Date()
      }

      // Convert dueDate string to Date if provided
      if (data.dueDate) {
        updates.dueDate = new Date(data.dueDate)
      }

      return await this.reminderRepository.update(id, updates)
    } catch (error) {
      this.handleError(error, `Failed to update reminder ${id}`)
      throw error
    }
  }

  async deleteReminder(id: string): Promise<void> {
    try {
      const existingReminder = await this.getReminderById(id)
      await this.reminderRepository.delete(id)
    } catch (error) {
      this.handleError(error, `Failed to delete reminder ${id}`)
      throw error
    }
  }

  async snoozeReminder(id: string, minutes: number): Promise<IReminder> {
    try {
      const reminder = await this.getReminderById(id)
      
      if (reminder.status === 'completed') {
        throw new ValidationError('Cannot snooze a completed reminder')
      }

      if (minutes <= 0) {
        throw new ValidationError('Snooze duration must be positive')
      }

      const newDueDate = addMinutes(reminder.dueDate, minutes)
      
      return await this.reminderRepository.update(id, {
        dueDate: newDueDate,
        status: 'snoozed',
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to snooze reminder ${id}`)
      throw error
    }
  }

  async markAsCompleted(id: string): Promise<IReminder> {
    try {
      const reminder = await this.getReminderById(id)
      
      return await this.reminderRepository.update(id, {
        status: 'completed',
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to mark reminder ${id} as completed`)
      throw error
    }
  }

  async getUpcomingReminders(minutesAhead: number = 60): Promise<IReminder[]> {
    try {
      const now = new Date()
      const futureTime = addMinutes(now, minutesAhead)
      
      return await this.reminderRepository.findUpcoming(now, futureTime)
    } catch (error) {
      this.handleError(error, 'Failed to get upcoming reminders')
      throw error
    }
  }

  async getOverdueReminders(): Promise<IReminder[]> {
    try {
      const now = new Date()
      return await this.reminderRepository.findOverdue(now)
    } catch (error) {
      this.handleError(error, 'Failed to get overdue reminders')
      throw error
    }
  }
}
