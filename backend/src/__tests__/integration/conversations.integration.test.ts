import { jest } from '@jest/globals'
import { HttpRequest, InvocationContext } from '@azure/functions'
import { getConversations, createConversation } from '../../functions/chat/conversations'
import { HTTP_STATUS } from '@ai-chat/shared'

// Integration tests test the complete flow from HTTP request to response
// including middleware, services, and repositories (with mocked external dependencies)

describe('Conversations Integration Tests', () => {
  const mockContext = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  } as unknown as InvocationContext

  const createMockRequest = (
    query?: Record<string, string>,
    params?: Record<string, string>,
    body?: any,
    headers?: Record<string, string>
  ): HttpRequest => ({
    query: new URLSearchParams(query || {}),
    params: params || {},
    headers: headers || {},
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn(),
    arrayBuffer: jest.fn(),
    formData: jest.fn(),
  } as unknown as HttpRequest)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Full Request-Response Flow', () => {
    it('should handle complete conversation creation flow', async () => {
      // Test the full flow: Request -> Validation -> Service -> Repository -> Response
      const conversationData = { title: 'Integration Test Conversation' }
      const request = createMockRequest({}, {}, conversationData)
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.CREATED)
      expect(response.headers?.['Content-Type']).toBe('application/json')
      
      const body = JSON.parse(response.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(body.data.title).toBe(conversationData.title)
    })

    it('should handle complete conversation retrieval flow with pagination', async () => {
      const request = createMockRequest({ page: '1', limit: '5' })
      
      const response = await getConversations(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = JSON.parse(response.body as string)
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(body.pagination).toBeDefined()
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.limit).toBe(5)
    })

    it('should handle validation errors in the complete flow', async () => {
      // Test validation error handling through the entire stack
      const invalidData = { /* missing required title */ }
      const request = createMockRequest({}, {}, invalidData)
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = JSON.parse(response.body as string)
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })

  describe('Authentication Integration', () => {
    it('should handle requests with authentication headers', async () => {
      // In a real implementation, this would test the full auth flow
      const headers = { authorization: 'Bearer valid-token' }
      const request = createMockRequest({}, {}, {}, headers)
      
      const response = await getConversations(request, mockContext)
      
      // For now, auth is not enforced in the mock, but this tests the structure
      expect(response.status).toBe(HTTP_STATUS.OK)
    })

    it('should handle requests without authentication', async () => {
      const request = createMockRequest()
      
      const response = await getConversations(request, mockContext)
      
      // Currently returns OK since auth is not enforced in mock
      expect(response.status).toBe(HTTP_STATUS.OK)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle service layer errors gracefully', async () => {
      // Test error propagation through the layers
      const request = createMockRequest({}, {}, { title: 'Test' })
      
      // Mock JSON parsing error
      request.json = jest.fn().mockRejectedValue(new Error('Malformed JSON'))
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      const body = JSON.parse(response.body as string)
      expect(body.success).toBe(false)
    })

    it('should log errors appropriately', async () => {
      const request = createMockRequest({}, {}, { title: 'Test' })
      request.json = jest.fn().mockRejectedValue(new Error('Test error'))
      
      await createConversation(request, mockContext)
      
      expect(mockContext.error).toHaveBeenCalled()
    })
  })

  describe('Data Flow Integration', () => {
    it('should properly transform data through the layers', async () => {
      const inputData = { title: 'Data Flow Test' }
      const request = createMockRequest({}, {}, inputData)
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.CREATED)
      const body = JSON.parse(response.body as string)
      
      // Verify data transformation and enrichment
      expect(body.data.title).toBe(inputData.title)
      expect(body.data.id).toBeDefined()
    })

    it('should handle query parameter parsing correctly', async () => {
      const queryParams = { 
        page: '2', 
        limit: '25', 
        search: 'integration test' 
      }
      const request = createMockRequest(queryParams)
      
      const response = await getConversations(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = JSON.parse(response.body as string)
      expect(body.pagination.page).toBe(2)
      expect(body.pagination.limit).toBe(25)
    })
  })
})
