import type { Draft, CreateDraftData, UpdateDraftData, DraftFilters, PaginatedResponse, DraftStatus } from '@ai-chat/shared'
import type { DraftRepository as IDraftRepository } from './interfaces/draft'
import { mockDrafts } from '../data/mock-data'

export class DraftRepository implements IDraftRepository {
  private drafts: Draft[] = [...mockDrafts]

  async findById(id: string): Promise<Draft | null> {
    return this.drafts.find(draft => draft.id === id) || null
  }

  async findMany(filters: DraftFilters): Promise<PaginatedResponse<Draft>> {
    let filteredDrafts = [...this.drafts]

    // Apply filters
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      filteredDrafts = filteredDrafts.filter(draft => statuses.includes(draft.status))
    }

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type]
      filteredDrafts = filteredDrafts.filter(draft => types.includes(draft.type))
    }

    if (filters.conversationId) {
      filteredDrafts = filteredDrafts.filter(draft => draft.conversationId === filters.conversationId)
    }

    if (filters.title) {
      const titleLower = filters.title.toLowerCase()
      filteredDrafts = filteredDrafts.filter(draft =>
        draft.title.toLowerCase().includes(titleLower)
      )
    }

    if (filters.content) {
      const contentLower = filters.content.toLowerCase()
      filteredDrafts = filteredDrafts.filter(draft =>
        draft.content.toLowerCase().includes(contentLower)
      )
    }

    if (filters.category) {
      filteredDrafts = filteredDrafts.filter(draft =>
        draft.metadata?.category === filters.category
      )
    }

    if (filters.dateFrom) {
      filteredDrafts = filteredDrafts.filter(draft =>
        new Date(draft.createdAt) >= new Date(filters.dateFrom!)
      )
    }

    if (filters.dateTo) {
      filteredDrafts = filteredDrafts.filter(draft =>
        new Date(draft.createdAt) <= new Date(filters.dateTo!)
      )
    }

    if (filters.updatedAfter) {
      filteredDrafts = filteredDrafts.filter(draft =>
        new Date(draft.updatedAt) >= filters.updatedAfter!
      )
    }

    if (filters.updatedBefore) {
      filteredDrafts = filteredDrafts.filter(draft =>
        new Date(draft.updatedAt) <= filters.updatedBefore!
      )
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDrafts = filteredDrafts.slice(startIndex, endIndex)

    const total = filteredDrafts.length
    const totalPages = Math.ceil(total / limit)

    return {
      data: paginatedDrafts,
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
    }
  }

  async create(data: CreateDraftData): Promise<Draft> {
    const newDraft: Draft = {
      id: `draft_${Date.now()}`,
      title: data.title,
      content: data.content,
      type: data.type,
      status: 'draft',
      conversationId: data.conversationId,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.drafts.push(newDraft)
    return newDraft
  }

  async update(id: string, data: UpdateDraftData): Promise<Draft | null> {
    const index = this.drafts.findIndex(draft => draft.id === id)
    if (index === -1) return null

    this.drafts[index] = {
      ...this.drafts[index],
      ...data,
      updatedAt: new Date()
    }

    return this.drafts[index]
  }

  async delete(id: string): Promise<void> {
    const index = this.drafts.findIndex(draft => draft.id === id)
    if (index === -1) {
      throw new Error(`Draft with id ${id} not found`)
    }
    this.drafts.splice(index, 1)
  }

  async count(filters?: Partial<DraftFilters>): Promise<number> {
    if (!filters) return this.drafts.length

    const result = await this.findMany(filters as DraftFilters)
    return result.pagination.total
  }
  async findByStatus(status: DraftStatus): Promise<Draft[]> {
    return this.drafts.filter(draft => draft.status === status)
  }

  async findRecent(limit: number): Promise<Draft[]> {
    return this.drafts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  async findByConversationId(conversationId: string): Promise<Draft[]> {
    return this.drafts.filter(draft => draft.conversationId === conversationId)
  }

  async search(query: string, filters?: Partial<DraftFilters>): Promise<Draft[]> {
    const queryLower = query.toLowerCase()
    let results = this.drafts.filter(draft =>
      draft.title.toLowerCase().includes(queryLower) ||
      draft.content.toLowerCase().includes(queryLower)
    )

    if (filters) {
      const fullFilters = { ...filters, limit: undefined, page: undefined } as DraftFilters
      const paginatedResult = await this.findMany(fullFilters)
      const filteredIds = new Set(paginatedResult.data.map(d => d.id))
      results = results.filter(draft => filteredIds.has(draft.id))
    }

    return results
  }
}