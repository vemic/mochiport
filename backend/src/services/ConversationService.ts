import { BaseService } from "./BaseService"
import { IConversation, IMessage, CreateConversationRequest, UpdateConversationRequest, GetConversationsFilters, PaginatedResponse } from "@ai-chat/shared"
import { IConversationRepository } from "../repositories/interfaces/conversation"
import { ConversationRepository } from "../repositories/ConversationRepository"
import { NotFoundError, ValidationError } from "../utils/errors"

export class ConversationService extends BaseService<IConversation> {
  private conversationRepository: IConversationRepository

  constructor() {
    super()
    this.conversationRepository = new ConversationRepository()
  }

  async getConversations(filters: GetConversationsFilters): Promise<PaginatedResponse<IConversation>> {
    try {
      return await this.conversationRepository.findMany(filters)
    } catch (error) {
      this.handleError(error, 'Failed to get conversations')
      throw error
    }
  }

  async getConversationById(id: string): Promise<IConversation> {
    try {
      const conversation = await this.conversationRepository.findById(id)
      
      if (!conversation) {
        throw new NotFoundError(`Conversation with ID ${id} not found`)
      }
      
      return conversation
    } catch (error) {
      this.handleError(error, `Failed to get conversation ${id}`)
      throw error
    }
  }

  async createConversation(data: CreateConversationRequest): Promise<IConversation> {
    try {
      if (!data.title?.trim()) {
        throw new ValidationError('Conversation title is required')
      }

      const newConversation: Omit<IConversation, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title.trim(),
        messages: data.messages || [],
        status: 'active',
        metadata: data.metadata || {}
      }

      return await this.conversationRepository.create(newConversation)
    } catch (error) {
      this.handleError(error, 'Failed to create conversation')
      throw error
    }
  }

  async updateConversation(id: string, data: UpdateConversationRequest): Promise<IConversation> {
    try {
      const existingConversation = await this.getConversationById(id)
      
      if (data.title !== undefined && !data.title.trim()) {
        throw new ValidationError('Conversation title cannot be empty')
      }

      const updates: Partial<IConversation> = {
        ...data,
        updatedAt: new Date()
      }

      if (data.title) {
        updates.title = data.title.trim()
      }

      return await this.conversationRepository.update(id, updates)
    } catch (error) {
      this.handleError(error, `Failed to update conversation ${id}`)
      throw error
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const existingConversation = await this.getConversationById(id)
      await this.conversationRepository.delete(id)
    } catch (error) {
      this.handleError(error, `Failed to delete conversation ${id}`)
      throw error
    }
  }

  async addMessage(conversationId: string, message: Omit<IMessage, 'id' | 'timestamp'>): Promise<IConversation> {
    try {
      const conversation = await this.getConversationById(conversationId)
      
      if (!message.content?.trim()) {
        throw new ValidationError('Message content is required')
      }

      if (!['user', 'assistant'].includes(message.role)) {
        throw new ValidationError('Message role must be either "user" or "assistant"')
      }

      const newMessage: IMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message.content.trim(),
        timestamp: new Date()
      }

      const updatedMessages = [...conversation.messages, newMessage]

      return await this.conversationRepository.update(conversationId, {
        messages: updatedMessages,
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to add message to conversation ${conversationId}`)
      throw error
    }
  }

  async updateMessage(conversationId: string, messageId: string, content: string): Promise<IConversation> {
    try {
      const conversation = await this.getConversationById(conversationId)
      
      if (!content?.trim()) {
        throw new ValidationError('Message content is required')
      }

      const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) {
        throw new NotFoundError(`Message with ID ${messageId} not found in conversation`)
      }

      const updatedMessages = [...conversation.messages]
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: content.trim(),
        timestamp: new Date() // Update timestamp when content is modified
      }

      return await this.conversationRepository.update(conversationId, {
        messages: updatedMessages,
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to update message ${messageId} in conversation ${conversationId}`)
      throw error
    }
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<IConversation> {
    try {
      const conversation = await this.getConversationById(conversationId)
      
      const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) {
        throw new NotFoundError(`Message with ID ${messageId} not found in conversation`)
      }

      const updatedMessages = conversation.messages.filter(msg => msg.id !== messageId)

      return await this.conversationRepository.update(conversationId, {
        messages: updatedMessages,
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to delete message ${messageId} from conversation ${conversationId}`)
      throw error
    }
  }

  async archiveConversation(id: string): Promise<IConversation> {
    try {
      const conversation = await this.getConversationById(id)
      
      if (conversation.status === 'archived') {
        throw new ValidationError('Conversation is already archived')
      }

      return await this.conversationRepository.update(id, {
        status: 'archived',
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to archive conversation ${id}`)
      throw error
    }
  }

  async restoreConversation(id: string): Promise<IConversation> {
    try {
      const conversation = await this.getConversationById(id)
      
      if (conversation.status !== 'archived') {
        throw new ValidationError('Only archived conversations can be restored')
      }

      return await this.conversationRepository.update(id, {
        status: 'active',
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to restore conversation ${id}`)
      throw error
    }
  }

  async getRecentConversations(limit: number = 10): Promise<IConversation[]> {
    try {
      return await this.conversationRepository.findRecent(limit)
    } catch (error) {
      this.handleError(error, 'Failed to get recent conversations')
      throw error
    }
  }

  async searchConversations(query: string): Promise<IConversation[]> {
    try {
      if (!query?.trim()) {
        throw new ValidationError('Search query is required')
      }

      return await this.conversationRepository.search(query.trim())
    } catch (error) {
      this.handleError(error, 'Failed to search conversations')
      throw error
    }
  }
}
