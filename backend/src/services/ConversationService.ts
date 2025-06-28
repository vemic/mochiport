import { 
  DatabaseConversation, 
  ConversationWithMessages, 
  ConversationSummary,
  DatabaseMessage,
  ConversationFilters,
  ConversationService as IConversationService
} from "../models/database.js"
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { MessageRepository } from '../repositories/MessageRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { IAIService, AIServiceFactory } from './AIService.js';
import { DatabaseServiceFactory } from './DatabaseServiceFactory.js';
import { Message } from '@mochiport/shared'
import { supabase } from '../config/supabase.js';

export class ConversationService implements IConversationService {
  private conversationRepository: ConversationRepository | null
  private messageRepository: MessageRepository | null
  private aiService: IAIService
  private mockData: Map<string, ConversationWithMessages> = new Map();
  private useMockDatabase: boolean;

  constructor() {
    this.useMockDatabase = DatabaseServiceFactory.isUsingMock();
    
    if (this.useMockDatabase) {
      console.log('ConversationService: Using mock database');
      this.conversationRepository = null;
      this.messageRepository = null;
      this.initializeMockData();
    } else {
      console.log('ConversationService: Using Supabase database');
      this.conversationRepository = new ConversationRepository(supabase);
      this.messageRepository = new MessageRepository(supabase);
    }
    
    this.aiService = AIServiceFactory.getInstance();
  }

  private initializeMockData(): void {
    // モックデータの初期化
    const mockConversation: ConversationWithMessages = {
      id: 'conv-1',
      user_id: 'user-1',
      title: 'サンプル会話',
      status: 'active',
      metadata: { summary: 'AIとの最初の会話です', tags: ['test', 'sample'] },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          user_id: 'user-1',
          content: 'こんにちは！',
          role: 'user',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          metadata: { tokens: 5 }
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          user_id: 'user-1',
          content: 'こんにちは！どのようにお手伝いできますか？',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          metadata: { tokens: 15, processingTime: 0.5, confidence: 0.9 }
        }
      ]
    };
    
    this.mockData.set('conv-1', mockConversation);
  }

  // DatabaseMessageをshared Messageに変換するヘルパー関数
  private convertToSharedMessage(dbMessage: DatabaseMessage): Message {
    return {
      id: dbMessage.id,
      content: dbMessage.content,
      role: dbMessage.role,
      timestamp: new Date(dbMessage.timestamp),
      metadata: dbMessage.metadata
    }
  }
  async getConversations(userId: string, filters?: ConversationFilters): Promise<ConversationSummary[]> {
    try {
      const result = await this.conversationRepository.findSummaries(userId, filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    } catch (error) {
      console.error('Failed to get conversations:', error);
      throw error;
    }
  }

  async getConversation(id: string, userId: string): Promise<ConversationWithMessages | null> {
    try {
      const result = await this.conversationRepository.findWithMessages(id, userId);
      if (!result.success) {
        if (result.error?.includes('not found')) {
          return null;
        }
        throw new Error(result.error);
      }
      return result.data || null;
    } catch (error) {
      console.error(`Failed to get conversation ${id}:`, error);
      throw error;
    }
  }

  async createConversation(data: { title: string; initialMessage?: string }, userId: string): Promise<ConversationWithMessages> {
    try {
      if (!data.title?.trim()) {
        throw new ValidationError('Conversation title is required')
      }

      if (data.initialMessage) {
        // 初期メッセージ付きで会話を作成
        const result = await this.conversationRepository.createWithInitialMessage(
          { title: data.title.trim() },
          { content: data.initialMessage, role: 'user' },
          userId
        );
        
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data!;
      } else {
        // 初期メッセージなしで会話を作成
        const conversationData: Omit<DatabaseConversation, 'id' | 'created_at' | 'updated_at'> = {
          title: data.title.trim(),
          user_id: userId,
          status: 'active',
          metadata: {}
        };

        const result = await this.conversationRepository.create(conversationData, userId);
        if (!result.success) {
          throw new Error(result.error);
        }

        // メッセージなしの会話を返す
        return {
          ...result.data!,
          messages: []
        };
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async updateConversation(id: string, data: { title?: string }, userId: string): Promise<ConversationWithMessages | null> {
    try {
      if (data.title !== undefined && !data.title.trim()) {
        throw new ValidationError('Conversation title cannot be empty')
      }

      const updates: Partial<DatabaseConversation> = {};
      if (data.title) {
        updates.title = data.title.trim();
      }
      updates.updated_at = new Date().toISOString();

      const result = await this.conversationRepository.update(id, updates, userId);
      if (!result.success) {
        if (result.error?.includes('not found')) {
          return null;
        }
        throw new Error(result.error);
      }

      // 更新後の会話とメッセージを取得
      return await this.getConversation(id, userId);
    } catch (error) {
      console.error(`Failed to update conversation ${id}:`, error);
      throw error;
    }
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.conversationRepository.delete(id, userId);
      if (!result.success) {
        if (result.error?.includes('not found')) {
          return false;
        }
        throw new Error(result.error);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete conversation ${id}:`, error);
      throw error;
    }
  }

  async addMessage(conversationId: string, content: string, role: 'user' | 'assistant', userId: string): Promise<DatabaseMessage> {
    try {
      if (!content?.trim()) {
        throw new ValidationError('Message content is required')
      }

      if (!['user', 'assistant'].includes(role)) {
        throw new ValidationError('Message role must be either "user" or "assistant"')
      }      const messageData: Omit<DatabaseMessage, 'id' | 'created_at'> = {
        user_id: userId,
        conversation_id: conversationId,
        content: content.trim(),
        role,
        timestamp: new Date().toISOString(),
        metadata: {}
      };

      const result = await this.messageRepository.create(messageData, userId);
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data!;
    } catch (error) {
      console.error(`Failed to add message to conversation ${conversationId}:`, error);
      throw error;
    }
  }
  async generateAIResponse(conversationId: string, userId: string): Promise<DatabaseMessage> {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      if (!conversation) {
        throw new NotFoundError('Conversation not found');
      }
      
      // DatabaseMessage[]をMessage[]に変換
      const sharedMessages: Message[] = (conversation.messages || []).map(dbMessage => 
        this.convertToSharedMessage(dbMessage)
      );
      
      // AIサービスを使用して応答を生成
      const aiResponse = await this.aiService.generateResponse(sharedMessages);
      
      // AI応答メッセージを作成
      return await this.addMessage(conversationId, aiResponse.text, 'assistant', userId);
    } catch (error) {
      console.error(`Failed to generate AI response for conversation ${conversationId}:`, error);
      throw error;
    }
  }
}
