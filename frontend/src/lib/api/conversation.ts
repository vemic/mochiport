import { httpClient } from './client';
import {
  Conversation,
  ConversationSummary,
  CreateConversationData,
  UpdateConversationData,
  ConversationFilters,
  ApiResponse,
  PaginatedResponse
} from '@mochiport/shared';

export const conversationApi = {
  /**
   * Get all conversations with optional filters
   */  async getAll(filters?: ConversationFilters): Promise<PaginatedResponse<ConversationSummary>> {
    return httpClient.get<PaginatedResponse<ConversationSummary>>('/api/conversations', filters);
  },

  /**
   * Get a specific conversation by ID
   */
  async getById(id: string): Promise<ApiResponse<Conversation>> {
    return httpClient.get<ApiResponse<Conversation>>(`/api/conversations/${id}`);
  },

  /**
   * Create a new conversation
   */
  async create(data: CreateConversationData): Promise<ApiResponse<Conversation>> {
    return httpClient.post<ApiResponse<Conversation>>('/api/conversations', data);
  },

  /**
   * Update an existing conversation
   */
  async update(id: string, data: UpdateConversationData): Promise<ApiResponse<Conversation>> {
    return httpClient.patch<ApiResponse<Conversation>>(`/api/conversations/${id}`, data);
  },

  /**
   * Delete a conversation
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>(`/api/conversations/${id}`);
  },

  /**
   * Archive a conversation
   */
  async archive(id: string): Promise<ApiResponse<Conversation>> {
    return httpClient.patch<ApiResponse<Conversation>>(`/api/conversations/${id}/archive`);
  },

  /**
   * Restore an archived conversation
   */
  async restore(id: string): Promise<ApiResponse<Conversation>> {
    return httpClient.patch<ApiResponse<Conversation>>(`/api/conversations/${id}/restore`);
  },

  /**
   * Add a message to a conversation
   */
  async addMessage(conversationId: string, message: { content: string; role: 'user' | 'assistant' }): Promise<ApiResponse<Conversation>> {
    return httpClient.post<ApiResponse<Conversation>>(`/api/conversations/${conversationId}/messages`, message);
  },

  /**
   * Get conversation statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    archived: number;
    completedToday: number;
  }>> {
    return httpClient.get<ApiResponse<{
      total: number;
      active: number;
      archived: number;
      completedToday: number;
    }>>('/api/conversations/stats');
  },
};
