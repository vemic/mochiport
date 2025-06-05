import { httpClient } from './client';
import {
  Draft,
  CreateDraftData,
  UpdateDraftData,
  DraftFilters,
  ApiResponse,
  PaginatedResponse
} from '@mochiport/shared';

export const draftApi = {
  /**
   * Get all drafts with optional filters
   */  async getAll(filters?: DraftFilters): Promise<PaginatedResponse<Draft>> {
    return httpClient.get<PaginatedResponse<Draft>>('/api/drafts', filters);
  },

  /**
   * Get a specific draft by ID
   */
  async getById(id: string): Promise<ApiResponse<Draft>> {
    return httpClient.get<ApiResponse<Draft>>(`/api/drafts/${id}`);
  },

  /**
   * Create a new draft
   */
  async create(data: CreateDraftData): Promise<ApiResponse<Draft>> {
    return httpClient.post<ApiResponse<Draft>>('/api/drafts', data);
  },

  /**
   * Update an existing draft
   */
  async update(id: string, data: UpdateDraftData): Promise<ApiResponse<Draft>> {
    return httpClient.patch<ApiResponse<Draft>>(`/api/drafts/${id}`, data);
  },

  /**
   * Delete a draft
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>(`/api/drafts/${id}`);
  },

  /**
   * Publish a draft
   */
  async publish(id: string): Promise<ApiResponse<Draft>> {
    return httpClient.patch<ApiResponse<Draft>>(`/api/drafts/${id}/publish`);
  },

  /**
   * Unpublish a draft
   */
  async unpublish(id: string): Promise<ApiResponse<Draft>> {
    return httpClient.patch<ApiResponse<Draft>>(`/api/drafts/${id}/unpublish`);
  },

  /**
   * Duplicate a draft
   */
  async duplicate(id: string): Promise<ApiResponse<Draft>> {
    return httpClient.post<ApiResponse<Draft>>(`/api/drafts/${id}/duplicate`);
  },

  /**
   * Get recent drafts
   */
  async getRecent(limit = 10): Promise<ApiResponse<Draft[]>> {
    return httpClient.get<ApiResponse<Draft[]>>('/api/drafts/recent', { limit });
  },

  /**
   * Search drafts by content
   */
  async search(query: string): Promise<ApiResponse<Draft[]>> {
    return httpClient.get<ApiResponse<Draft[]>>('/api/drafts/search', { q: query });
  },

  /**
   * Get draft statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    draft: number;
    published: number;
    recentlyUpdated: number;
  }>> {
    return httpClient.get<ApiResponse<{
      total: number;
      draft: number;
      published: number;
      recentlyUpdated: number;
    }>>('/api/drafts/stats');
  },

  /**
   * Auto-save a draft
   */
  async autoSave(id: string, content: string): Promise<ApiResponse<Draft>> {
    return httpClient.patch<ApiResponse<Draft>>(`/api/drafts/${id}/auto-save`, {
      content,
      autoSaved: true,
    });
  },
};
