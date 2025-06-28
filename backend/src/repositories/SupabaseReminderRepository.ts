import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Reminder, 
  CreateReminderData, 
  UpdateReminderData, 
  ReminderFilters, 
  PaginatedResponse,
  ReminderStatus 
} from '@mochiport/shared';
import { ReminderRepository } from './interfaces/reminder.js';

export class SupabaseReminderRepository implements ReminderRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateReminderData): Promise<Reminder> {
    try {
      const now = new Date();
      const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: reminderData, error } = await this.supabase
        .from('reminders')
        .insert({
          id: reminderId,
          title: data.title,
          description: data.description,
          due_date: data.dueDate.toISOString(),
          scheduled_at: data.scheduledAt.toISOString(),
          type: data.type,
          priority: data.priority,
          status: 'pending',
          conversation_id: data.conversationId,
          metadata: data.metadata || {},
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create reminder: ${error.message}`);
      }

      return {
        id: reminderData.id,
        title: reminderData.title,
        description: reminderData.description,
        dueDate: new Date(reminderData.due_date),
        scheduledAt: new Date(reminderData.scheduled_at),
        type: reminderData.type,
        priority: reminderData.priority,
        status: reminderData.status,
        conversationId: reminderData.conversation_id,
        metadata: reminderData.metadata || {},
        createdAt: new Date(reminderData.created_at),
        updatedAt: new Date(reminderData.updated_at)
      };
    } catch (error) {
      throw new Error(`Database error in create: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Reminder | null> {
    try {
      const { data, error } = await this.supabase
        .from('reminders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Failed to find reminder: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.due_date),
        scheduledAt: new Date(data.scheduled_at),
        type: data.type,
        priority: data.priority,
        status: data.status,
        conversationId: data.conversation_id,
        metadata: data.metadata || {},
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw new Error(`Database error in findById: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findMany(filters: ReminderFilters): Promise<PaginatedResponse<Reminder>> {
    try {
      let query = this.supabase
        .from('reminders')
        .select('*', { count: 'exact' });

      // フィルタを適用
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        query = query.in('type', types);
      }

      if (filters.conversationId) {
        query = query.eq('conversation_id', filters.conversationId);
      }

      if (filters.priority) {
        const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        query = query.in('priority', priorities);
      }

      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }

      if (filters.description) {
        query = query.ilike('description', `%${filters.description}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('due_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('due_date', filters.dateTo);
      }

      if (filters.createdAfter) {
        query = query.gte('created_at', filters.createdAfter.toISOString());
      }

      if (filters.createdBefore) {
        query = query.lte('created_at', filters.createdBefore.toISOString());
      }

      if (filters.scheduledAfter) {
        query = query.gte('scheduled_at', filters.scheduledAfter.toISOString());
      }

      if (filters.scheduledBefore) {
        query = query.lte('scheduled_at', filters.scheduledBefore.toISOString());
      }

      // ソート
      query = query.order('due_date', { ascending: true });

      // ページネーション
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data: remindersData, error, count } = await query;

      if (error) {
        throw new Error(`Failed to find reminders: ${error.message}`);
      }

      const reminders: Reminder[] = remindersData.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        dueDate: new Date(reminder.due_date),
        scheduledAt: new Date(reminder.scheduled_at),
        type: reminder.type,
        priority: reminder.priority,
        status: reminder.status,
        conversationId: reminder.conversation_id,
        metadata: reminder.metadata || {},
        createdAt: new Date(reminder.created_at),
        updatedAt: new Date(reminder.updated_at)
      }));

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: reminders,
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
      };
    } catch (error) {
      throw new Error(`Database error in findMany: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, data: UpdateReminderData): Promise<Reminder | null> {
    try {
      const updateFields: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // 日付フィールドの変換
      if (data.dueDate) {
        updateFields.due_date = data.dueDate.toISOString();
        delete updateFields.dueDate;
      }

      if (data.scheduledAt) {
        updateFields.scheduled_at = data.scheduledAt.toISOString();
        delete updateFields.scheduledAt;
      }

      const { data: reminderData, error } = await this.supabase
        .from('reminders')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Failed to update reminder: ${error.message}`);
      }

      return {
        id: reminderData.id,
        title: reminderData.title,
        description: reminderData.description,
        dueDate: new Date(reminderData.due_date),
        scheduledAt: new Date(reminderData.scheduled_at),
        type: reminderData.type,
        priority: reminderData.priority,
        status: reminderData.status,
        conversationId: reminderData.conversation_id,
        metadata: reminderData.metadata || {},
        createdAt: new Date(reminderData.created_at),
        updatedAt: new Date(reminderData.updated_at)
      };
    } catch (error) {
      throw new Error(`Database error in update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete reminder: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Database error in delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(filters?: Partial<ReminderFilters>): Promise<number> {
    try {
      let query = this.supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true });

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters?.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        query = query.in('type', types);
      }

      if (filters?.conversationId) {
        query = query.eq('conversation_id', filters.conversationId);
      }

      const { count, error } = await query;

      if (error) {
        throw new Error(`Failed to count reminders: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Database error in count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  async findByStatus(status: string[]): Promise<Reminder[]> {
    const result = await this.findMany({ status: status as ReminderStatus[], limit: 1000 });
    return result.data;
  }

  async findByConversation(conversationId: string): Promise<Reminder[]> {
    const result = await this.findMany({ conversationId, limit: 1000 });
    return result.data;
  }

  async findUpcoming(limit: number = 10): Promise<Reminder[]> {
    try {
      const now = new Date();
      const { data, error } = await this.supabase
        .from('reminders')
        .select('*')
        .eq('status', 'pending')
        .gt('scheduled_at', now.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to find upcoming reminders: ${error.message}`);
      }

      return data.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        dueDate: new Date(reminder.due_date),
        scheduledAt: new Date(reminder.scheduled_at),
        type: reminder.type,
        priority: reminder.priority,
        status: reminder.status,
        conversationId: reminder.conversation_id,
        metadata: reminder.metadata || {},
        createdAt: new Date(reminder.created_at),
        updatedAt: new Date(reminder.updated_at)
      }));
    } catch (error) {
      throw new Error(`Database error in findUpcoming: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findOverdue(): Promise<Reminder[]> {
    try {
      const now = new Date();
      const { data, error } = await this.supabase
        .from('reminders')
        .select('*')
        .eq('status', 'pending')
        .lt('due_date', now.toISOString())
        .order('due_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to find overdue reminders: ${error.message}`);
      }

      return data.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        dueDate: new Date(reminder.due_date),
        scheduledAt: new Date(reminder.scheduled_at),
        type: reminder.type,
        priority: reminder.priority,
        status: reminder.status,
        conversationId: reminder.conversation_id,
        metadata: reminder.metadata || {},
        createdAt: new Date(reminder.created_at),
        updatedAt: new Date(reminder.updated_at)
      }));
    } catch (error) {
      throw new Error(`Database error in findOverdue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string, filters?: Partial<ReminderFilters>): Promise<Reminder[]> {
    try {
      let supabaseQuery = this.supabase
        .from('reminders')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        supabaseQuery = supabaseQuery.in('status', statuses);
      }

      if (filters?.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        supabaseQuery = supabaseQuery.in('type', types);
      }

      if (filters?.conversationId) {
        supabaseQuery = supabaseQuery.eq('conversation_id', filters.conversationId);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(`Failed to search reminders: ${error.message}`);
      }

      return data.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        dueDate: new Date(reminder.due_date),
        scheduledAt: new Date(reminder.scheduled_at),
        type: reminder.type,
        priority: reminder.priority,
        status: reminder.status,
        conversationId: reminder.conversation_id,
        metadata: reminder.metadata || {},
        createdAt: new Date(reminder.created_at),
        updatedAt: new Date(reminder.updated_at)
      }));
    } catch (error) {
      throw new Error(`Database error in search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async markAsCompleted(id: string): Promise<Reminder> {
    const result = await this.update(id, { status: 'completed' });
    if (!result) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    return result;
  }

  async snooze(id: string, minutes: number): Promise<Reminder> {
    const reminder = await this.findById(id);
    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`);
    }

    const newScheduledAt = new Date(reminder.scheduledAt.getTime() + minutes * 60 * 1000);
    const result = await this.update(id, { scheduledAt: newScheduledAt });
    if (!result) {
      throw new Error(`Failed to snooze reminder with id ${id}`);
    }
    return result;
  }
}
