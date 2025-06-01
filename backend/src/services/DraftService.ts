import { BaseService } from "./BaseService"
import { IDraft, IConversation, CreateDraftRequest, UpdateDraftRequest, GetDraftsFilters, PaginatedResponse } from "@ai-chat/shared"
import { IDraftRepository } from "../repositories/interfaces/draft"
import { IConversationRepository } from "../repositories/interfaces/conversation"
import { DraftRepository } from "../repositories/DraftRepository"
import { ConversationRepository } from "../repositories/ConversationRepository"
import { NotFoundError, ValidationError } from "../utils/errors"

export class DraftService extends BaseService<IDraft> {
  private draftRepository: IDraftRepository
  private conversationRepository: IConversationRepository

  constructor() {
    super()
    this.draftRepository = new DraftRepository()
    this.conversationRepository = new ConversationRepository()
  }

  async getDrafts(filters: GetDraftsFilters): Promise<PaginatedResponse<IDraft>> {
    try {
      return await this.draftRepository.findMany(filters)
    } catch (error) {
      this.handleError(error, 'Failed to get drafts')
      throw error
    }
  }

  async getDraftById(id: string): Promise<IDraft> {
    try {
      const draft = await this.draftRepository.findById(id)
      
      if (!draft) {
        throw new NotFoundError(`Draft with ID ${id} not found`)
      }
      
      return draft
    } catch (error) {
      this.handleError(error, `Failed to get draft ${id}`)
      throw error
    }
  }

  async createDraft(data: CreateDraftRequest): Promise<IDraft> {
    try {
      const newDraft: Omit<IDraft, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        content: data.content || '',
        status: 'draft',
        conversationId: data.conversationId,
        metadata: data.metadata || {}
      }

      return await this.draftRepository.create(newDraft)
    } catch (error) {
      this.handleError(error, 'Failed to create draft')
      throw error
    }
  }

  async updateDraft(id: string, data: UpdateDraftRequest): Promise<IDraft> {
    try {
      const existingDraft = await this.getDraftById(id)
      
      // Don't allow updating published drafts
      if (existingDraft.status === 'published') {
        throw new ValidationError('Cannot update a published draft')
      }

      const updates: Partial<IDraft> = {
        ...data,
        updatedAt: new Date()
      }

      return await this.draftRepository.update(id, updates)
    } catch (error) {
      this.handleError(error, `Failed to update draft ${id}`)
      throw error
    }
  }

  async deleteDraft(id: string): Promise<void> {
    try {
      const existingDraft = await this.getDraftById(id)
      
      // Don't allow deleting published drafts
      if (existingDraft.status === 'published') {
        throw new ValidationError('Cannot delete a published draft')
      }

      await this.draftRepository.delete(id)
    } catch (error) {
      this.handleError(error, `Failed to delete draft ${id}`)
      throw error
    }
  }

  async autoSaveDraft(id: string, content: string): Promise<IDraft> {
    try {
      const existingDraft = await this.getDraftById(id)
      
      // Don't allow auto-saving published drafts
      if (existingDraft.status === 'published') {
        throw new ValidationError('Cannot auto-save a published draft')
      }

      return await this.draftRepository.update(id, {
        content,
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to auto-save draft ${id}`)
      throw error
    }
  }

  async publishDraft(id: string): Promise<IConversation> {
    try {
      const draft = await this.getDraftById(id)
      
      if (draft.status === 'published') {
        throw new ValidationError('Draft is already published')
      }

      if (!draft.content.trim()) {
        throw new ValidationError('Cannot publish empty draft')
      }

      // Create new conversation from draft
      const newConversation: Omit<IConversation, 'id' | 'createdAt' | 'updatedAt'> = {
        title: draft.title || 'Untitled Conversation',
        messages: [
          {
            id: `msg_${Date.now()}`,
            content: draft.content,
            role: 'user',
            timestamp: new Date()
          }
        ],
        status: 'active',
        metadata: {
          ...draft.metadata,
          publishedFromDraft: draft.id
        }
      }

      const conversation = await this.conversationRepository.create(newConversation)

      // Mark draft as published
      await this.draftRepository.update(id, {
        status: 'published',
        conversationId: conversation.id,
        updatedAt: new Date()
      })

      return conversation
    } catch (error) {
      this.handleError(error, `Failed to publish draft ${id}`)
      throw error
    }
  }

  async duplicateDraft(id: string): Promise<IDraft> {
    try {
      const originalDraft = await this.getDraftById(id)
      
      const newDraft: Omit<IDraft, 'id' | 'createdAt' | 'updatedAt'> = {
        title: `${originalDraft.title} (Copy)`,
        content: originalDraft.content,
        status: 'draft',
        conversationId: originalDraft.conversationId,
        metadata: {
          ...originalDraft.metadata,
          duplicatedFrom: originalDraft.id
        }
      }

      return await this.draftRepository.create(newDraft)
    } catch (error) {
      this.handleError(error, `Failed to duplicate draft ${id}`)
      throw error
    }
  }

  async archiveDraft(id: string): Promise<IDraft> {
    try {
      const draft = await this.getDraftById(id)
      
      if (draft.status === 'published') {
        throw new ValidationError('Cannot archive a published draft')
      }

      return await this.draftRepository.update(id, {
        status: 'archived',
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to archive draft ${id}`)
      throw error
    }
  }

  async restoreDraft(id: string): Promise<IDraft> {
    try {
      const draft = await this.getDraftById(id)
      
      if (draft.status !== 'archived') {
        throw new ValidationError('Only archived drafts can be restored')
      }

      return await this.draftRepository.update(id, {
        status: 'draft',
        updatedAt: new Date()
      })
    } catch (error) {
      this.handleError(error, `Failed to restore draft ${id}`)
      throw error
    }
  }

  async getDraftsByConversation(conversationId: string): Promise<IDraft[]> {
    try {
      return await this.draftRepository.findByConversationId(conversationId)
    } catch (error) {
      this.handleError(error, `Failed to get drafts for conversation ${conversationId}`)
      throw error
    }
  }

  async getRecentDrafts(limit: number = 10): Promise<IDraft[]> {
    try {
      return await this.draftRepository.findRecent(limit)
    } catch (error) {
      this.handleError(error, 'Failed to get recent drafts')
      throw error
    }
  }
}
