import { IDraftRepository } from "./interfaces/draft"
import { IDraft, GetDraftsFilters, PaginatedResponse } from "@ai-chat/shared"

export class DraftRepository implements IDraftRepository {
  // In-memory storage for development - replace with actual database
  private drafts: IDraft[] = []
  private nextId = 1

  async findById(id: string): Promise<IDraft | null> {
    return this.drafts.find(draft => draft.id === id) || null
  }

  async findMany(filters: GetDraftsFilters): Promise<PaginatedResponse<IDraft>> {
    let filteredDrafts = [...this.drafts]

    // Apply status filter
    if (filters.status) {
      filteredDrafts = filteredDrafts.filter(draft => draft.status === filters.status)
    }

    // Apply conversation filter
    if (filters.conversationId) {
      filteredDrafts = filteredDrafts.filter(draft => draft.conversationId === filters.conversationId)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredDrafts = filteredDrafts.filter(draft => 
        draft.title.toLowerCase().includes(searchLower) ||
        draft.content.toLowerCase().includes(searchLower)
      )
    }

    // Sort by updated date (descending by default)
    filteredDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const offset = (page - 1) * limit
    
    const paginatedDrafts = filteredDrafts.slice(offset, offset + limit)
    const total = filteredDrafts.length
    const totalPages = Math.ceil(total / limit)

    return {
      data: paginatedDrafts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  async create(data: Omit<IDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDraft> {
    const now = new Date()
    const newDraft: IDraft = {
      ...data,
      id: `draft_${this.nextId++}`,
      createdAt: now,
      updatedAt: now
    }

    this.drafts.push(newDraft)
    return newDraft
  }

  async update(id: string, data: Partial<IDraft>): Promise<IDraft> {
    const index = this.drafts.findIndex(draft => draft.id === id)
    if (index === -1) {
      throw new Error(`Draft with ID ${id} not found`)
    }

    const updatedDraft = {
      ...this.drafts[index],
      ...data,
      updatedAt: new Date()
    }

    this.drafts[index] = updatedDraft
    return updatedDraft
  }

  async delete(id: string): Promise<void> {
    const index = this.drafts.findIndex(draft => draft.id === id)
    if (index === -1) {
      throw new Error(`Draft with ID ${id} not found`)
    }

    this.drafts.splice(index, 1)
  }

  async findByConversationId(conversationId: string): Promise<IDraft[]> {
    return this.drafts.filter(draft => draft.conversationId === conversationId)
  }

  async findByStatus(status: IDraft['status']): Promise<IDraft[]> {
    return this.drafts.filter(draft => draft.status === status)
  }

  async findRecent(limit: number): Promise<IDraft[]> {
    return this.drafts
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  async search(query: string): Promise<IDraft[]> {
    const searchLower = query.toLowerCase()
    return this.drafts.filter(draft => 
      draft.title.toLowerCase().includes(searchLower) ||
      draft.content.toLowerCase().includes(searchLower)
    )
  }

  async count(filters?: Partial<GetDraftsFilters>): Promise<number> {
    if (!filters) {
      return this.drafts.length
    }

    let filteredDrafts = [...this.drafts]

    if (filters.status) {
      filteredDrafts = filteredDrafts.filter(draft => draft.status === filters.status)
    }

    if (filters.conversationId) {
      filteredDrafts = filteredDrafts.filter(draft => draft.conversationId === filters.conversationId)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredDrafts = filteredDrafts.filter(draft => 
        draft.title.toLowerCase().includes(searchLower) ||
        draft.content.toLowerCase().includes(searchLower)
      )
    }

    return filteredDrafts.length
  }
}
