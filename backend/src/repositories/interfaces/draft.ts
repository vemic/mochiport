import { BaseRepository } from './base.js';
import { Draft, DraftFilters, PaginatedResponse, CreateDraftData, UpdateDraftData } from "@mochiport/shared"

export interface DraftRepository extends BaseRepository<Draft, CreateDraftData, UpdateDraftData, DraftFilters> {
  /**
   * Find drafts with filters and pagination
   */
  findMany(filters: DraftFilters): Promise<PaginatedResponse<Draft>>

  /**
   * Find drafts by conversation ID
   */
  findByConversationId(conversationId: string): Promise<Draft[]>

  /**
   * Find drafts by status
   */
  findByStatus(status: Draft['status']): Promise<Draft[]>

  /**
   * Find recent drafts
   */
  findRecent(limit: number): Promise<Draft[]>

  /**
   * Search drafts by content or title
   */
  search(query: string): Promise<Draft[]>

  /**
   * Count total drafts
   */
  count(filters?: Partial<DraftFilters>): Promise<number>
}
