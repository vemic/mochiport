
import { DraftService } from '../../services/DraftService'
import { DraftRepository } from '../../repositories/DraftRepository'
import { ConversationRepository } from '../../repositories/ConversationRepository'
import { NotFoundError, ValidationError } from '../../utils/errors'

// Mock the repositories
jest.mock('../../repositories/DraftRepository')
jest.mock('../../repositories/ConversationRepository')

describe('DraftService', () => {
  let draftService: DraftService
  let mockDraftRepository: jest.Mocked<DraftRepository>
  let mockConversationRepository: jest.Mocked<ConversationRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    draftService = new DraftService()
    mockDraftRepository = (draftService as any).draftRepository
    mockConversationRepository = (draftService as any).conversationRepository
  })

  describe('getDrafts', () => {
    it('should return paginated drafts', async () => {
      const mockFilters = { page: 1, limit: 10 }
      const mockResponse = {
        data: [
          {
            id: '1',
            title: 'Test Draft',
            content: 'Test content',
            status: 'draft' as const,
            conversationId: 'conv-1',
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        pagination: { total: 1, page: 1, limit: 10 }
      }

      mockDraftRepository.findMany.mockResolvedValue(mockResponse)

      const result = await draftService.getDrafts(mockFilters)

      expect(result).toEqual(mockResponse)
      expect(mockDraftRepository.findMany).toHaveBeenCalledWith(mockFilters)
    })

    it('should handle repository errors', async () => {
      const mockFilters = { page: 1, limit: 10 }
      const mockError = new Error('Database error')

      mockDraftRepository.findMany.mockRejectedValue(mockError)

      await expect(draftService.getDrafts(mockFilters)).rejects.toThrow(mockError)
    })
  })

  describe('getDraftById', () => {
    it('should return draft when found', async () => {
      const mockDraft = {
        id: '1',
        title: 'Test Draft',
        content: 'Test content',
        status: 'draft' as const,
        conversationId: 'conv-1',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.findById.mockResolvedValue(mockDraft)

      const result = await draftService.getDraftById('1')

      expect(result).toEqual(mockDraft)
      expect(mockDraftRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when draft not found', async () => {
      mockDraftRepository.findById.mockResolvedValue(null)

      await expect(draftService.getDraftById('1')).rejects.toThrow(NotFoundError)
      await expect(draftService.getDraftById('1')).rejects.toThrow('Draft with ID 1 not found')
    })
  })

  describe('createDraft', () => {
    it('should create draft with valid data', async () => {
      const mockData = {
        title: 'New Draft',
        content: 'Draft content',
        conversationId: 'conv-1',
        metadata: { type: 'message' }
      }

      const mockCreatedDraft = {
        id: '1',
        ...mockData,
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.create.mockResolvedValue(mockCreatedDraft)

      const result = await draftService.createDraft(mockData)

      expect(result).toEqual(mockCreatedDraft)
      expect(mockDraftRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockData.title,
          content: mockData.content,
          conversationId: mockData.conversationId,
          status: 'draft',
          metadata: mockData.metadata
        })
      )
    })

    it('should create draft with default values when optional fields not provided', async () => {
      const mockData = {
        title: 'New Draft',
        conversationId: 'conv-1'
      }

      const mockCreatedDraft = {
        id: '1',
        title: 'New Draft',
        content: '',
        conversationId: 'conv-1',
        status: 'draft' as const,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.create.mockResolvedValue(mockCreatedDraft)

      await draftService.createDraft(mockData)

      expect(mockDraftRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '',
          metadata: {}
        })
      )
    })
  })

  describe('updateDraft', () => {
    it('should update draft when found', async () => {
      const mockData = {
        title: 'Updated Draft',
        content: 'Updated content'
      }

      const mockUpdatedDraft = {
        id: '1',
        title: 'Updated Draft',
        content: 'Updated content',
        status: 'draft' as const,
        conversationId: 'conv-1',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.findById.mockResolvedValue(mockUpdatedDraft)
      mockDraftRepository.update.mockResolvedValue(mockUpdatedDraft)

      const result = await draftService.updateDraft('1', mockData)

      expect(result).toEqual(mockUpdatedDraft)
      expect(mockDraftRepository.findById).toHaveBeenCalledWith('1')
      expect(mockDraftRepository.update).toHaveBeenCalledWith('1', mockData)
    })

    it('should throw NotFoundError when draft not found', async () => {
      mockDraftRepository.findById.mockResolvedValue(null)

      await expect(draftService.updateDraft('1', {})).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteDraft', () => {
    it('should delete draft when found', async () => {
      const mockDraft = {
        id: '1',
        title: 'Test Draft',
        content: 'Test content',
        status: 'draft' as const,
        conversationId: 'conv-1',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.findById.mockResolvedValue(mockDraft)
      mockDraftRepository.delete.mockResolvedValue(true)

      const result = await draftService.deleteDraft('1')

      expect(result).toBe(true)
      expect(mockDraftRepository.findById).toHaveBeenCalledWith('1')
      expect(mockDraftRepository.delete).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when draft not found', async () => {
      mockDraftRepository.findById.mockResolvedValue(null)

      await expect(draftService.deleteDraft('1')).rejects.toThrow(NotFoundError)
    })
  })

  describe('publishDraft', () => {
    it('should publish draft to conversation', async () => {
      const mockDraft = {
        id: '1',
        title: 'Test Draft',
        content: 'Test content',
        status: 'draft' as const,
        conversationId: 'conv-1',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockConversation = {
        id: 'conv-1',
        title: 'Test Conversation',
        messages: [],
        status: 'active' as const,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockPublishedDraft = {
        ...mockDraft,
        status: 'published' as const
      }

      mockDraftRepository.findById.mockResolvedValue(mockDraft)
      mockConversationRepository.findById.mockResolvedValue(mockConversation)
      mockDraftRepository.update.mockResolvedValue(mockPublishedDraft)
      mockConversationRepository.update.mockResolvedValue(mockConversation)

      const result = await draftService.publishDraft('1')

      expect(result).toEqual(mockPublishedDraft)
      expect(mockDraftRepository.update).toHaveBeenCalledWith('1', { status: 'published' })
      expect(mockConversationRepository.update).toHaveBeenCalledWith('conv-1', 
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: 'Test content',
              type: 'user'
            })
          ])
        })
      )
    })

    it('should throw NotFoundError when draft not found', async () => {
      mockDraftRepository.findById.mockResolvedValue(null)

      await expect(draftService.publishDraft('1')).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when conversation not found', async () => {
      const mockDraft = {
        id: '1',
        title: 'Test Draft',
        content: 'Test content',
        status: 'draft' as const,
        conversationId: 'conv-1',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.findById.mockResolvedValue(mockDraft)
      mockConversationRepository.findById.mockResolvedValue(null)

      await expect(draftService.publishDraft('1')).rejects.toThrow(NotFoundError)
      await expect(draftService.publishDraft('1')).rejects.toThrow('Conversation with ID conv-1 not found')
    })

    it('should throw ValidationError when draft is already published', async () => {
      const mockDraft = {
        id: '1',
        title: 'Test Draft',
        content: 'Test content',
        status: 'published' as const,
        conversationId: 'conv-1',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.findById.mockResolvedValue(mockDraft)

      await expect(draftService.publishDraft('1')).rejects.toThrow(ValidationError)
      await expect(draftService.publishDraft('1')).rejects.toThrow('Draft is already published')
    })
  })

  describe('getDraftsByConversation', () => {
    it('should return drafts for a conversation', async () => {
      const mockDrafts = [
        {
          id: '1',
          title: 'Draft 1',
          content: 'Content 1',
          status: 'draft' as const,
          conversationId: 'conv-1',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Draft 2',
          content: 'Content 2',
          status: 'draft' as const,
          conversationId: 'conv-1',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockDraftRepository.findByConversationId.mockResolvedValue(mockDrafts)

      const result = await draftService.getDraftsByConversation('conv-1')

      expect(result).toEqual(mockDrafts)
      expect(mockDraftRepository.findByConversationId).toHaveBeenCalledWith('conv-1')
    })
  })

  describe('autoSaveDraft', () => {
    it('should create new draft when auto-saving new content', async () => {
      const mockData = {
        title: 'Auto-saved Draft',
        content: 'Auto-saved content',
        conversationId: 'conv-1'
      }

      const mockCreatedDraft = {
        id: '1',
        ...mockData,
        status: 'draft' as const,
        metadata: { autoSaved: true },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDraftRepository.create.mockResolvedValue(mockCreatedDraft)

      const result = await draftService.autoSaveDraft(mockData)

      expect(result).toEqual(mockCreatedDraft)
      expect(mockDraftRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { autoSaved: true }
        })
      )
    })

    it('should update existing draft when auto-saving with draftId', async () => {
      const mockData = {
        title: 'Updated Auto-saved Draft',
        content: 'Updated auto-saved content',
        conversationId: 'conv-1'
      }

      const mockExistingDraft = {
        id: '1',
        title: 'Old title',
        content: 'Old content',
        status: 'draft' as const,
        conversationId: 'conv-1',
        metadata: { autoSaved: true },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockUpdatedDraft = {
        ...mockExistingDraft,
        ...mockData,
        updatedAt: new Date()
      }

      mockDraftRepository.findById.mockResolvedValue(mockExistingDraft)
      mockDraftRepository.update.mockResolvedValue(mockUpdatedDraft)

      const result = await draftService.autoSaveDraft(mockData, '1')

      expect(result).toEqual(mockUpdatedDraft)
      expect(mockDraftRepository.update).toHaveBeenCalledWith('1', mockData)
    })
  })
})
