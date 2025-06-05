import { ConversationRepository as IConversationRepository } from "./interfaces/conversation"
import { 
  Conversation, 
  ConversationFilters, 
  PaginatedResponse,
  CreateConversationData,
  UpdateConversationData 
} from "@mochiport/shared"
import { mockConversations } from "../data/mock-data"

export class ConversationRepository implements IConversationRepository {
  // In-memory storage for development - replace with actual database
  private conversations: Conversation[] = [...mockConversations]
  private nextId = mockConversations.length + 1

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.find(conversation => conversation.id === id) || null
  }

  async findMany(filters: ConversationFilters): Promise<PaginatedResponse<Conversation>> {
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
  }  async create(data: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'> | CreateConversationData): Promise<Conversation> {
    const now = new Date()
    
    // Ensure all required fields exist
    const fullData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'> = {
      title: data.title,
      messages: 'messages' in data ? data.messages : [],
      status: 'status' in data ? data.status : 'active',
      metadata: data.metadata || {}
    }
    
    const newConversation: Conversation = {
      ...fullData,
      id: `conversation_${this.nextId++}`,
      createdAt: now,
      updatedAt: now
    }

    this.conversations.push(newConversation)
    return newConversation
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
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

  async getByStatus(status: Conversation['status']): Promise<Conversation[]> {
    return this.conversations.filter(conversation => conversation.status === status)
  }

  async getRecentConversations(limit = 10): Promise<Conversation[]> {
    return this.conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  async archiveConversation(id: string): Promise<Conversation> {
    return this.update(id, { status: 'archived' })
  }

  async restoreConversation(id: string): Promise<Conversation> {
    return this.update(id, { status: 'active' })
  }

  async search(query: string): Promise<Conversation[]> {
    const searchLower = query.toLowerCase()
    return this.conversations.filter(conversation => 
      conversation.title.toLowerCase().includes(searchLower) ||
      conversation.messages.some(message => 
        message.content.toLowerCase().includes(searchLower)
      )
    )
  }

  async count(filters?: Partial<ConversationFilters>): Promise<number> {
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

  // BaseRepositoryインターフェース用メソッド
  async getById(id: string): Promise<Conversation | null> {
    return this.findById(id)
  }

  async getAll(filters?: ConversationFilters): Promise<PaginatedResponse<Conversation>> {
    return this.findMany(filters || {})
  }

  async exists(id: string): Promise<boolean> {
    const conversation = await this.findById(id)
    return conversation !== null
  }
}
