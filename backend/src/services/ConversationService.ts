import { BaseService } from "./BaseService"
import { 
  Conversation, 
  Message, 
  CreateConversationData, 
  UpdateConversationData, 
  ConversationFilters,
  PaginatedResponse,
  ValidationResult,
  ValidationError as SharedValidationError
} from "@ai-chat/shared"
import { ConversationRepository as IConversationRepository } from "../repositories/interfaces/conversation"
import { ConversationRepository } from "../repositories/ConversationRepository"
import { NotFoundError, ValidationError } from "../utils/errors"
import { IAIService, AIService, MockAIService } from "./AIService"

export class ConversationService extends BaseService<Conversation, CreateConversationData, UpdateConversationData> {
  private conversationRepository: IConversationRepository
  private aiService: IAIService

  constructor(useMockAI: boolean = true) {
    super()
    this.conversationRepository = new ConversationRepository()
    this.aiService = useMockAI ? new MockAIService() : new AIService()
  }  protected validate(data: CreateConversationData | UpdateConversationData): { success: boolean; errors: any[] } {
    const errors: any[] = [];
    
    if ('title' in data && data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      errors.push({
        field: 'title',
        message: 'Title is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  async getConversations(filters: ConversationFilters): Promise<PaginatedResponse<Conversation>> {
    try {
      return await this.conversationRepository.findMany(filters)
    } catch (error) {
      this.handleError(error as Error, 'Failed to get conversations')
      throw error
    }
  }
  async getConversationById(id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationRepository.findById(id)
      
      if (!conversation) {
        throw new NotFoundError(`Conversation not found`)
      }
      
      return conversation
    } catch (error) {
      this.handleError(error as Error, `Failed to get conversation ${id}`)
      throw error
    }
  }  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      if (!data.title?.trim()) {
        throw new ValidationError('Conversation title is required')
      }

      // Pass the data through, let the repository handle the defaults
      const conversationData = {
        ...data,
        title: data.title.trim()
      }

      return await this.conversationRepository.create(conversationData)
    } catch (error) {
      this.handleError(error as Error, 'Failed to create conversation')
      throw error
    }
  }
  async updateConversation(id: string, data: UpdateConversationData): Promise<Conversation> {
    try {
      const existingConversation = await this.getConversationById(id)
      
      if (data.title !== undefined && !data.title.trim()) {
        throw new ValidationError('Conversation title cannot be empty')
      }

      const updates: UpdateConversationData = {
        ...data
      }

      if (data.title) {
        updates.title = data.title.trim()
      }

      const updatedConversation = await this.conversationRepository.update(id, updates)
      if (!updatedConversation) {
        throw new Error(`Failed to update conversation ${id}`)
      }
      return updatedConversation
    } catch (error) {
      this.handleError(error as Error, `Failed to update conversation ${id}`)
      throw error
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const existingConversation = await this.getConversationById(id)
      await this.conversationRepository.delete(id)
    } catch (error) {
      this.handleError(error as Error, `Failed to delete conversation ${id}`)
      throw error
    }
  }
  async addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Conversation> {
    try {
      const conversation = await this.getConversationById(conversationId)
      
      if (!message.content?.trim()) {
        throw new ValidationError('Message content is required')
      }

      if (!['user', 'assistant'].includes(message.role)) {
        throw new ValidationError('Message role must be either "user" or "assistant"')
      }

      const newMessage: Message = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message.content.trim(),
        timestamp: new Date()
      }

      const updatedMessages = [...conversation.messages, newMessage]

      const updates: UpdateConversationData = {
        messages: updatedMessages
      }

      const updatedConversation = await this.conversationRepository.update(conversationId, updates)
      if (!updatedConversation) {
        throw new Error(`Failed to add message to conversation ${conversationId}`)
      }
      return updatedConversation
    } catch (error) {
      this.handleError(error as Error, `Failed to add message to conversation ${conversationId}`)
      throw error
    }
  }

  async create(data: CreateConversationData): Promise<Conversation> {
    return this.createConversation(data)
  }

  /**
   * 会話履歴に基づいてAIの応答を生成し、会話に追加する
   * @param conversationId 会話ID
   * @returns 更新された会話
   */
  async generateAIResponse(conversationId: string): Promise<Conversation> {
    try {
      const conversation = await this.getConversationById(conversationId)
      
      // AIサービスを使用して応答を生成
      const aiResponse = await this.aiService.generateResponse(conversation.messages)
      
      // AI応答メッセージを作成
      const aiMessage: Omit<Message, 'id' | 'timestamp'> = {
        content: aiResponse.text,
        role: 'assistant',
        metadata: aiResponse.metadata
      }
      
      // メッセージを会話に追加
      return await this.addMessage(conversationId, aiMessage)
    } catch (error) {
      this.handleError(error as Error, `Failed to generate AI response for conversation ${conversationId}`)
      throw error
    }
  }
}
