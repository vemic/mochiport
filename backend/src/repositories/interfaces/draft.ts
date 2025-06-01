import { IBaseRepository } from "./base"
import { IDraft, GetDraftsFilters, PaginatedResponse } from "@ai-chat/shared"

export interface IDraftRepository extends IBaseRepository<IDraft> {
  /**
   * Find drafts with filters and pagination
   */
  findMany(filters: GetDraftsFilters): Promise<PaginatedResponse<IDraft>>

  /**
   * Find drafts by conversation ID
   */
  findByConversationId(conversationId: string): Promise<IDraft[]>

  /**
   * Find drafts by status
   */
  findByStatus(status: IDraft['status']): Promise<IDraft[]>

  /**
   * Find recent drafts
   */
  findRecent(limit: number): Promise<IDraft[]>

  /**
   * Search drafts by content or title
   */
  search(query: string): Promise<IDraft[]>

  /**
   * Count total drafts
   */
  count(filters?: Partial<GetDraftsFilters>): Promise<number>
}
