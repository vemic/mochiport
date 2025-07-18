import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './BaseService.js';
import { 
  Draft, 
  CreateDraftData, 
    UpdateDraftData, 
  DraftFilters,
  PaginatedResponse
} from "@mochiport/shared"
import { DraftRepository as IDraftRepository } from '../repositories/interfaces/draft.js';
import { DraftRepository } from '../repositories/DraftRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class DraftService extends BaseService<Draft, CreateDraftData, UpdateDraftData> {
  private draftRepository: IDraftRepository
  private conversationRepository: ConversationRepository
  constructor(private supabase: SupabaseClient) {
    super()
    this.draftRepository = new DraftRepository()
    this.conversationRepository = new ConversationRepository(supabase)
  }

  protected validate(data: CreateDraftData | UpdateDraftData): { success: boolean; errors: any[] } {
    const errors: any[] = [];
    
    if ('title' in data && data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      errors.push({
        field: 'title',
        message: 'Title is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    if ('conversationId' in data && data.conversationId !== undefined && (!data.conversationId || data.conversationId.trim().length === 0)) {
      errors.push({
        field: 'conversationId',
        message: 'Conversation ID is required',
        code: 'REQUIRED'
      });
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
  // Alias methods to match expected interface
  async findMany(filters: DraftFilters): Promise<PaginatedResponse<Draft>> {
    return this.getDrafts(filters)
  }

  async findById(id: string): Promise<Draft> {
    return this.getDraftById(id)
  }

  async update(id: string, data: UpdateDraftData): Promise<Draft> {
    return this.updateDraft(id, data)
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteDraft(id)
  }

  async getDrafts(filters: DraftFilters): Promise<PaginatedResponse<Draft>> {
    try {
      return await this.draftRepository.findMany(filters)
    } catch (error) {
      this.handleError(error as Error, 'Failed to get drafts')
      throw error
    }
  }

  async getDraftById(id: string): Promise<Draft> {
    try {
      const draft = await this.draftRepository.findById(id)
      
      if (!draft) {
        throw new NotFoundError(`Draft with ID ${id} not found`)
      }
      
      return draft
    } catch (error) {
      this.handleError(error as Error, `Failed to get draft ${id}`)
      throw error
    }
  }
  async createDraft(data: CreateDraftData): Promise<Draft> {
    try {
      const validation = this.validate(data)
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors)
      }

      const newDraft: CreateDraftData & { status: string } = {
        title: data.title || '',
        content: data.content || '',
        type: data.type || 'note',
        status: 'draft',
        conversationId: data.conversationId,
        metadata: data.metadata || {}
      }

      return await this.draftRepository.create(newDraft)
    } catch (error) {
      this.handleError(error as Error, 'Failed to create draft')
      throw error
    }
  }
  async updateDraft(id: string, data: UpdateDraftData): Promise<Draft> {
    try {
      // 存在チェックのみを行い、変数は使用しないため"await"のみを呼び出す
      await this.getDraftById(id)
      
      const validation = this.validate(data)
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors)
      }

      const updatedDraft = await this.draftRepository.update(id, data)
      if (!updatedDraft) {
        throw new Error(`Failed to update draft ${id}`)
      }
      
      return updatedDraft
    } catch (error) {
      this.handleError(error as Error, `Failed to update draft ${id}`)
      throw error
    }
  }
  async deleteDraft(id: string): Promise<boolean> {
    try {
      // 存在チェックのみを行う
      await this.getDraftById(id)
      await this.draftRepository.delete(id)
      return true
    } catch (error) {
      this.handleError(error as Error, `Failed to delete draft ${id}`)
      throw error
    }
  }  async publishDraft(id: string, userId: string): Promise<Draft> {
    try {
      const draft = await this.getDraftById(id)
      
      if (draft.status === 'published') {
        throw new ValidationError('Draft is already published')
      }

      // Check if conversationId exists
      if (!draft.conversationId) {
        throw new ValidationError('Draft must have a conversation ID to be published')
      }

      // Verify conversation exists
      const conversationResult = await this.conversationRepository.findById(draft.conversationId, userId)
      if (!conversationResult.success || !conversationResult.data) {
        throw new NotFoundError(`Conversation with ID ${draft.conversationId} not found`)
      }
      
      const conversation = conversationResult.data;

      // Add draft content as a message to the conversation
      // Note: For now, we'll just update the conversation title to include the draft info
      // In a full implementation, you'd use a MessageRepository to add the message
      
      // Update conversation with metadata about the published draft
      await this.conversationRepository.update(draft.conversationId, {
        metadata: {
          ...conversation.metadata,
          publishedFromDraft: draft.id
        }
      }, userId)

      // Mark draft as published
      const publishedDraft = await this.draftRepository.update(id, { status: 'published' })
      if (!publishedDraft) {
        throw new Error(`Failed to publish draft ${id}`)
      }

      return publishedDraft
    } catch (error) {
      this.handleError(error as Error, `Failed to publish draft ${id}`)
      throw error
    }
  }
  async getDraftsByConversation(conversationId: string): Promise<Draft[]> {
    try {
      if (!conversationId) {
        throw new ValidationError('Conversation ID is required')
      }
      return await this.draftRepository.findByConversationId(conversationId)
    } catch (error) {
      this.handleError(error as Error, `Failed to get drafts for conversation ${conversationId}`)
      throw error
    }
  }

  async autoSaveDraft(data: CreateDraftData, draftId?: string): Promise<Draft> {
    try {      if (draftId) {
        // Update existing draft - 存在確認のみを行う
        await this.getDraftById(draftId)
        return await this.updateDraft(draftId, data)
      } else {
        // Create new draft with auto-save metadata
        const autoSaveData = {
          ...data,
          metadata: {
            ...data.metadata,
            autoSaved: true
          }
        }
        return await this.createDraft(autoSaveData)
      }
    } catch (error) {
      this.handleError(error as Error, 'Failed to auto-save draft')
      throw error
    }
  }

  // Alias method for compatibility with BaseService pattern
  async create(data: CreateDraftData): Promise<Draft> {
    return this.createDraft(data)
  }
}