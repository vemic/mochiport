import { IConversationRepository } from "./interfaces/conversation"
import { IConversation, GetConversationsFilters, PaginatedResponse } from "@ai-chat/shared"

export class ConversationRepository implements IConversationRepository {
  // In-memory storage for development - replace with actual database
  private conversations: IConversation[] = []
  private nextId = 1

  async findById(id: string): Promise<IConversation | null> {
    return this.conversations.find(conversation => conversation.id === id) || null
  }

  async findMany(filters: GetConversationsFilters): Promise<PaginatedResponse<IConversation>> {
    let filteredConversations = [...this.conversations]

    // Apply status filter
    if (filters.status) {
      filteredConversations = filteredConversations.filter(conversation => conversation.status === filters.status)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredConversations = filteredConversations.filter(conversation => 
        conversation.title.toLowerCase().includes(searchLower) ||
        conversation.messages.some(message => 
          message.content.toLowerCase().includes(searchLower)
        )
      )
    }

    // Sort by updated date (descending by default)
    filteredConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const offset = (page - 1) * limit
    
    const paginatedConversations = filteredConversations.slice(offset, offset + limit)
    const total = filteredConversations.length
    const totalPages = Math.ceil(total / limit)

    return {
      data: paginatedConversations,
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

  async create(data: Omit<IConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<IConversation> {
    const now = new Date()
    const newConversation: IConversation = {
      ...data,
      id: `conversation_${this.nextId++}`,
      createdAt: now,
      updatedAt: now
    }

    this.conversations.push(newConversation)
    return newConversation
  }

  async update(id: string, data: Partial<IConversation>): Promise<IConversation> {
    const index = this.conversations.findIndex(conversation => conversation.id === id)
    if (index === -1) {
      throw new Error(`Conversation with ID ${id} not found`)
    }

    const updatedConversation = {
      ...this.conversations[index],
      ...data,
      updatedAt: new Date()
    }

    this.conversations[index] = updatedConversation
    return updatedConversation
  }

  async delete(id: string): Promise<void> {
    const index = this.conversations.findIndex(conversation => conversation.id === id)
    if (index === -1) {
      throw new Error(`Conversation with ID ${id} not found`)
    }

    this.conversations.splice(index, 1)
  }

  async findByStatus(status: IConversation['status']): Promise<IConversation[]> {
    return this.conversations.filter(conversation => conversation.status === status)
  }

  async findRecent(limit: number): Promise<IConversation[]> {
    return this.conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  async search(query: string): Promise<IConversation[]> {
    const searchLower = query.toLowerCase()
    return this.conversations.filter(conversation => 
      conversation.title.toLowerCase().includes(searchLower) ||
      conversation.messages.some(message => 
        message.content.toLowerCase().includes(searchLower)
      )
    )
  }

  async count(filters?: Partial<GetConversationsFilters>): Promise<number> {
    if (!filters) {
      return this.conversations.length
    }

    let filteredConversations = [...this.conversations]

    if (filters.status) {
      filteredConversations = filteredConversations.filter(conversation => conversation.status === filters.status)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredConversations = filteredConversations.filter(conversation => 
        conversation.title.toLowerCase().includes(searchLower) ||
        conversation.messages.some(message => 
          message.content.toLowerCase().includes(searchLower)
        )
      )
    }

    return filteredConversations.length
  }
}
