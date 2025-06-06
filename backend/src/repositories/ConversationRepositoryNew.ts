import { SupabaseClient } from '@supabase/supabase-js';
import {
  DatabaseConversation,
  DatabaseMessage,
  ConversationFilters,
  PaginationParams,
  DatabaseOperationResult,
  BaseRepository,
  ConversationWithMessages,
  ConversationSummary
} from '../models/database';

export class ConversationRepository implements BaseRepository<DatabaseConversation, ConversationFilters> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string, userId: string): Promise<DatabaseOperationResult<DatabaseConversation>> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Conversation not found' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to find conversation: ${error}` };
    }
  }

  async findMany(
    userId: string,
    filters?: ConversationFilters,
    pagination?: PaginationParams
  ): Promise<DatabaseOperationResult<DatabaseConversation[]>> {
    try {
      let query = this.supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId);

      // フィルター適用
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // 並び順
      query = query.order('updated_at', { ascending: false });

      // ページネーション
      if (pagination?.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination?.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: `Failed to find conversations: ${error}` };
    }
  }

  async create(
    data: Omit<DatabaseConversation, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<DatabaseOperationResult<DatabaseConversation>> {
    try {
      const { data: result, error } = await this.supabase
        .from('conversations')
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
      return { success: false, error: `Failed to create conversation: ${error}` };
    }
  }

  async update(
    id: string,
    data: Partial<DatabaseConversation>,
    userId: string
  ): Promise<DatabaseOperationResult<DatabaseConversation>> {
    try {
      const { data: result, error } = await this.supabase
        .from('conversations')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!result) {
        return { success: false, error: 'Conversation not found or access denied' };
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to update conversation: ${error}` };
    }
  }

  async delete(id: string, userId: string): Promise<DatabaseOperationResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: `Failed to delete conversation: ${error}` };
    }
  }

  async count(userId: string, filters?: ConversationFilters): Promise<DatabaseOperationResult<number>> {
    try {
      let query = this.supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { count, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return { success: false, error: `Failed to count conversations: ${error}` };
    }
  }

  // 会話とメッセージを一緒に取得
  async findWithMessages(id: string, userId: string): Promise<DatabaseOperationResult<ConversationWithMessages>> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          messages (*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Conversation not found' };
      }

      // メッセージを時系列でソート
      const sortedMessages = (data.messages || []).sort((a: DatabaseMessage, b: DatabaseMessage) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const result: ConversationWithMessages = {
        ...data,
        messages: sortedMessages
      };

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to find conversation with messages: ${error}` };
    }
  }

  // Supabaseストアドファンクションを使用した会話作成（初期メッセージ付き）
  async createWithInitialMessage(
    conversationData: { title: string; status?: string; metadata?: Record<string, any> },
    initialMessage: { content: string; role: 'user' | 'assistant' },
    userId: string
  ): Promise<DatabaseOperationResult<ConversationWithMessages>> {
    try {
      const { data, error } = await this.supabase.rpc('create_conversation_with_message', {
        p_user_id: userId,
        p_title: conversationData.title,
        p_initial_message: initialMessage.content,
        p_message_role: initialMessage.role
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Failed to create conversation' };
      }

      const conversationId = data[0].conversation_id;
      
      // 作成された会話とメッセージを取得
      return await this.findWithMessages(conversationId, userId);
    } catch (error) {      return { success: false, error: `Failed to create conversation with initial message: ${error}` };
    }
  }

  // ConversationSummaryを返すメソッド
  async findSummaries(
    userId: string,
    filters?: ConversationFilters,
    pagination?: PaginationParams
  ): Promise<DatabaseOperationResult<ConversationSummary[]>> {
    try {
      let query = this.supabase
        .from('conversations')
        .select(`
          id,
          title,
          status,
          created_at,
          updated_at,
          messages (
            content,
            role,
            timestamp
          )
        `)
        .eq('user_id', userId);

      // フィルター適用
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // 並び順
      query = query.order('updated_at', { ascending: false });

      // ページネーション
      if (pagination?.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination?.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // ConversationSummaryに変換
      const summaries: ConversationSummary[] = (data || []).map((conv: any) => {
        const messages = conv.messages || [];
        const sortedMessages = messages.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return {
          id: conv.id,
          title: conv.title,
          status: conv.status,
          messageCount: messages.length,
          lastMessage: sortedMessages.length > 0 ? {
            content: sortedMessages[0].content,
            role: sortedMessages[0].role,
            timestamp: sortedMessages[0].timestamp
          } : undefined,
          created_at: conv.created_at,
          updated_at: conv.updated_at
        };
      });

      return { success: true, data: summaries };
    } catch (error) {
      return { success: false, error: `Failed to find conversation summaries: ${error}` };
    }
  }
}
