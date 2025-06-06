import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Draft, 
  CreateDraftData, 
  UpdateDraftData, 
  DraftFilters, 
  PaginatedResponse, 
  DraftStatus 
} from '@mochiport/shared';
import { DraftRepository } from './interfaces/draft';

export class SupabaseDraftRepository implements DraftRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateDraftData): Promise<Draft> {
    try {
      const now = new Date();
      const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: draftData, error } = await this.supabase
        .from('drafts')
        .insert({
          id: draftId,
          title: data.title,
          content: data.content,
          type: data.type,
          status: 'draft',
          conversation_id: data.conversationId,
          metadata: data.metadata || {},
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create draft: ${error.message}`);
      }

      return {
        id: draftData.id,
        title: draftData.title,
        content: draftData.content,
        type: draftData.type,
        status: draftData.status,
        conversationId: draftData.conversation_id,
        metadata: draftData.metadata || {},
        createdAt: new Date(draftData.created_at),
        updatedAt: new Date(draftData.updated_at)
      };
    } catch (error) {
      throw new Error(`Database error in create: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Draft | null> {
    try {
      const { data, error } = await this.supabase
        .from('drafts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Failed to find draft: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        type: data.type,
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

  async findMany(filters: DraftFilters): Promise<PaginatedResponse<Draft>> {
    try {
      let query = this.supabase
        .from('drafts')
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

      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }

      if (filters.content) {
        query = query.ilike('content', `%${filters.content}%`);
      }

      if (filters.category) {
        query = query.eq('metadata->>category', filters.category);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.updatedAfter) {
        query = query.gte('updated_at', filters.updatedAfter.toISOString());
      }

      if (filters.updatedBefore) {
        query = query.lte('updated_at', filters.updatedBefore.toISOString());
      }

      // ソート
      query = query.order('updated_at', { ascending: false });

      // ページネーション
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data: draftsData, error, count } = await query;

      if (error) {
        throw new Error(`Failed to find drafts: ${error.message}`);
      }

      const drafts: Draft[] = draftsData.map(draft => ({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        type: draft.type,
        status: draft.status,
        conversationId: draft.conversation_id,
        metadata: draft.metadata || {},
        createdAt: new Date(draft.created_at),
        updatedAt: new Date(draft.updated_at)
      }));

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: drafts,
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

  async update(id: string, data: UpdateDraftData): Promise<Draft | null> {
    try {
      const updateFields: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: draftData, error } = await this.supabase
        .from('drafts')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Failed to update draft: ${error.message}`);
      }

      return {
        id: draftData.id,
        title: draftData.title,
        content: draftData.content,
        type: draftData.type,
        status: draftData.status,
        conversationId: draftData.conversation_id,
        metadata: draftData.metadata || {},
        createdAt: new Date(draftData.created_at),
        updatedAt: new Date(draftData.updated_at)
      };
    } catch (error) {
      throw new Error(`Database error in update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('drafts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete draft: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Database error in delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(filters?: Partial<DraftFilters>): Promise<number> {
    try {
      let query = this.supabase
        .from('drafts')
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
        throw new Error(`Failed to count drafts: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Database error in count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByStatus(status: DraftStatus): Promise<Draft[]> {
    const result = await this.findMany({ status, limit: 1000 });
    return result.data;
  }

  async findRecent(limit: number): Promise<Draft[]> {
    const result = await this.findMany({ limit });
    return result.data;
  }

  async findByConversationId(conversationId: string): Promise<Draft[]> {
    const result = await this.findMany({ conversationId, limit: 1000 });
    return result.data;
  }

  async search(query: string, filters?: Partial<DraftFilters>): Promise<Draft[]> {
    try {
      let supabaseQuery = this.supabase
        .from('drafts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

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
        throw new Error(`Failed to search drafts: ${error.message}`);
      }

      return data.map(draft => ({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        type: draft.type,
        status: draft.status,
        conversationId: draft.conversation_id,
        metadata: draft.metadata || {},
        createdAt: new Date(draft.created_at),
        updatedAt: new Date(draft.updated_at)
      }));
    } catch (error) {
      throw new Error(`Database error in search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
