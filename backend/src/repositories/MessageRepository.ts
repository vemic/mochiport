import { SupabaseClient } from '@supabase/supabase-js';
import {
  DatabaseMessage,
  MessageFilters,
  PaginationParams,
  DatabaseOperationResult,
  BaseRepository
} from '../models/database';

export class MessageRepository implements BaseRepository<DatabaseMessage, MessageFilters> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string, userId: string): Promise<DatabaseOperationResult<DatabaseMessage>> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Message not found' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to find message: ${error}` };
    }
  }

  async findMany(
    userId: string,
    filters?: MessageFilters,
    pagination?: PaginationParams
  ): Promise<DatabaseOperationResult<DatabaseMessage[]>> {
    try {
      let query = this.supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId);

      // フィルター適用
      if (filters?.conversationId) {
        query = query.eq('conversation_id', filters.conversationId);
      }

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.search) {
        query = query.ilike('content', `%${filters.search}%`);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      // 並び順
      query = query.order('timestamp', { ascending: true });

      // ページネーション
      if (pagination?.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination?.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: `Failed to find messages: ${error}` };
    }
  }

  async create(
    data: Omit<DatabaseMessage, 'id' | 'created_at'>,
    userId: string
  ): Promise<DatabaseOperationResult<DatabaseMessage>> {
    try {
      const { data: result, error } = await this.supabase
        .from('messages')
        .insert({
          ...data,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to create message: ${error}` };
    }
  }

  async update(
    id: string,
    data: Partial<DatabaseMessage>,
    userId: string
  ): Promise<DatabaseOperationResult<DatabaseMessage>> {
    try {
      const { data: result, error } = await this.supabase
        .from('messages')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!result) {
        return { success: false, error: 'Message not found or access denied' };
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to update message: ${error}` };
    }
  }

  async delete(id: string, userId: string): Promise<DatabaseOperationResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: `Failed to delete message: ${error}` };
    }
  }

  async count(userId: string, filters?: MessageFilters): Promise<DatabaseOperationResult<number>> {
    try {
      let query = this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (filters?.conversationId) {
        query = query.eq('conversation_id', filters.conversationId);
      }

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.search) {
        query = query.ilike('content', `%${filters.search}%`);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      const { count, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return { success: false, error: `Failed to count messages: ${error}` };
    }
  }

  // 会話のメッセージを時系列で取得（AI生成用）
  async findByConversationId(
    conversationId: string,
    userId: string,
    limit: number = 20
  ): Promise<DatabaseOperationResult<DatabaseMessage[]>> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: `Failed to find messages by conversation: ${error}` };
    }
  }

  // 最新のメッセージを取得
  async findLatestByConversationId(
    conversationId: string,
    userId: string
  ): Promise<DatabaseOperationResult<DatabaseMessage | null>> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return { success: true, data: null };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to find latest message: ${error}` };
    }
  }
}
