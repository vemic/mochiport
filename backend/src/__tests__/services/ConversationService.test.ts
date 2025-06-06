import { jest } from '@jest/globals'
import { ConversationService } from '../../services/ConversationService'
import { ConversationRepository } from '../../repositories/ConversationRepository'
import { NotFoundError } from '../../utils/errors'
import { IConversation } from '@mochiport/shared'

// Mock the repository
jest.mock('../../repositories/ConversationRepository')
const MockedConversationRepository = ConversationRepository as jest.MockedClass<typeof ConversationRepository>

describe('ConversationService', () => {
  let conversationService: ConversationService
  let mockRepository: jest.Mocked<ConversationRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    mockRepository = new MockedConversationRepository() as jest.Mocked<ConversationRepository>
    conversationService = new ConversationService()
    // Replace the private repository instance
    ;(conversationService as any).conversationRepository = mockRepository
  })

  const mockConversation: IConversation = {
    id: '1',
    title: 'Test Conversation',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: []
  }

  describe('getConversations', () => {
    it('should return paginated conversations', async () => {
      const mockResult = {
        data: [mockConversation],
        pagination: { total: 1, page: 1, limit: 10 }
      }
      mockRepository.findMany.mockResolvedValue(mockResult)

      const filters = { page: 1, limit: 10 }
      const result = await conversationService.getConversations(filters)

      expect(result).toEqual(mockResult)
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockRepository.findMany.mockRejectedValue(error)

      const filters = { page: 1, limit: 10 }
      
      await expect(conversationService.getConversations(filters)).rejects.toThrow(error)
    })

    it('should handle search filters', async () => {
      const mockResult = {
        data: [mockConversation],
        pagination: { total: 1, page: 1, limit: 10 }
      }
      mockRepository.findMany.mockResolvedValue(mockResult)

      const filters = { page: 1, limit: 10, search: 'test' }
      const result = await conversationService.getConversations(filters)

      expect(result).toEqual(mockResult)
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters)
    })
  })

  describe('getConversationById', () => {
    it('should return a conversation by ID', async () => {
      mockRepository.findById.mockResolvedValue(mockConversation)

      const result = await conversationService.getConversationById('1')

      expect(result).toEqual(mockConversation)
      expect(mockRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when conversation does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(conversationService.getConversationById('999')).rejects.toThrow(NotFoundError)
      await expect(conversationService.getConversationById('999')).rejects.toThrow('Conversation not found')
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockRepository.findById.mockRejectedValue(error)

      await expect(conversationService.getConversationById('1')).rejects.toThrow(error)
    })
  })

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const createData = { title: 'New Conversation' }
      mockRepository.create.mockResolvedValue(mockConversation)

      const result = await conversationService.createConversation(createData)

      expect(result).toEqual(mockConversation)
      expect(mockRepository.create).toHaveBeenCalledWith(createData)
    })

    it('should validate required fields', async () => {
      const invalidData = {} // Missing required title

      await expect(conversationService.createConversation(invalidData as any)).rejects.toThrow()
    })

    it('should handle repository errors', async () => {
      const createData = { title: 'New Conversation' }
      const error = new Error('Database error')
      mockRepository.create.mockRejectedValue(error)

      await expect(conversationService.createConversation(createData)).rejects.toThrow(error)
    })
  })

  describe('updateConversation', () => {
    it('should update an existing conversation', async () => {
      const updateData = { title: 'Updated Conversation' }
      const updatedConversation = { ...mockConversation, ...updateData }
      
      mockRepository.findById.mockResolvedValue(mockConversation)
      mockRepository.update.mockResolvedValue(updatedConversation)

      const result = await conversationService.updateConversation('1', updateData)

      expect(result).toEqual(updatedConversation)
      expect(mockRepository.findById).toHaveBeenCalledWith('1')
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should throw NotFoundError when conversation does not exist', async () => {
      const updateData = { title: 'Updated Conversation' }
      mockRepository.findById.mockResolvedValue(null)

      await expect(conversationService.updateConversation('999', updateData)).rejects.toThrow(NotFoundError)
    })

    it('should handle repository errors', async () => {
      const updateData = { title: 'Updated Conversation' }
      const error = new Error('Database error')
      mockRepository.findById.mockRejectedValue(error)

      await expect(conversationService.updateConversation('1', updateData)).rejects.toThrow(error)
    })
  })

  describe('deleteConversation', () => {
    it('should delete an existing conversation', async () => {
      mockRepository.findById.mockResolvedValue(mockConversation)
      mockRepository.delete.mockResolvedValue(true)

      await conversationService.deleteConversation('1')

      expect(mockRepository.findById).toHaveBeenCalledWith('1')
      expect(mockRepository.delete).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when conversation does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(conversationService.deleteConversation('999')).rejects.toThrow(NotFoundError)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockRepository.findById.mockRejectedValue(error)

      await expect(conversationService.deleteConversation('1')).rejects.toThrow(error)
    })
  })

  describe('addMessage', () => {
    it('should add a message to a conversation', async () => {
      const messageData = {
        content: 'Hello, world!',
        role: 'user' as const
      }
      const conversationWithMessage = {
        ...mockConversation,
        messages: [{ id: '1', ...messageData, timestamp: new Date() }]
      }
      
      mockRepository.findById.mockResolvedValue(mockConversation)
      mockRepository.update.mockResolvedValue(conversationWithMessage)

      const result = await conversationService.addMessage('1', messageData)

      expect(result).toEqual(conversationWithMessage)
      expect(mockRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when conversation does not exist', async () => {
      const messageData = { content: 'Hello', role: 'user' as const }
      mockRepository.findById.mockResolvedValue(null)

      await expect(conversationService.addMessage('999', messageData)).rejects.toThrow(NotFoundError)
    })
  })
})
