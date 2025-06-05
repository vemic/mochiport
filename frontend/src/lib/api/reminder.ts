import { httpClient } from './client';
import {
  Reminder,
  CreateReminderData,
  UpdateReminderData,
  ReminderFilters,
  ApiResponse,
  PaginatedResponse
} from '@ai-chat/shared';

export const reminderApi = {
  /**
   * Get all reminders with optional filters
   */  async getAll(filters?: ReminderFilters): Promise<PaginatedResponse<Reminder>> {
    return httpClient.get<PaginatedResponse<Reminder>>('/api/reminders', filters);
  },

  /**
   * Get a specific reminder by ID
   */
  async getById(id: string): Promise<ApiResponse<Reminder>> {
    return httpClient.get<ApiResponse<Reminder>>(`/api/reminders/${id}`);
  },

  /**
   * Create a new reminder
   */
  async create(data: CreateReminderData): Promise<ApiResponse<Reminder>> {
    return httpClient.post<ApiResponse<Reminder>>('/api/reminders', data);
  },

  /**
   * Update an existing reminder
   */
  async update(id: string, data: UpdateReminderData): Promise<ApiResponse<Reminder>> {
    return httpClient.patch<ApiResponse<Reminder>>(`/api/reminders/${id}`, data);
  },

  /**
   * Delete a reminder
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>(`/api/reminders/${id}`);
  },

  /**
   * Mark a reminder as completed
   */
  async complete(id: string): Promise<ApiResponse<Reminder>> {
    return httpClient.patch<ApiResponse<Reminder>>(`/api/reminders/${id}/complete`);
  },

  /**
   * Snooze a reminder until a specific date
   */
  async snooze(id: string, snoozeUntil: Date): Promise<ApiResponse<Reminder>> {
    return httpClient.patch<ApiResponse<Reminder>>(`/api/reminders/${id}/snooze`, {
      snoozeUntil: snoozeUntil.toISOString(),
    });
  },

  /**
   * Get upcoming reminders
   */
  async getUpcoming(limit = 10): Promise<ApiResponse<Reminder[]>> {
    return httpClient.get<ApiResponse<Reminder[]>>('/api/reminders/upcoming', { limit });
  },

  /**
   * Get overdue reminders
   */
  async getOverdue(): Promise<ApiResponse<Reminder[]>> {
    return httpClient.get<ApiResponse<Reminder[]>>('/api/reminders/overdue');
  },

  /**
   * Get today's reminders
   */
  async getToday(): Promise<ApiResponse<Reminder[]>> {
    return httpClient.get<ApiResponse<Reminder[]>>('/api/reminders/today');
  },

  /**
   * Get reminder statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    dueToday: number;
  }>> {
    return httpClient.get<ApiResponse<{
      total: number;
      pending: number;
      completed: number;
      overdue: number;
      dueToday: number;
    }>>('/api/reminders/stats');
  },
};
