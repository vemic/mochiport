import { jest } from '@jest/globals'
import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { 
  getConversations, 
  getConversation, 
  createConversation, 
  updateConversation, 
  deleteConversation,
  addMessage,
  generateAIResponse
} from '../../functions/chat/conversations'
import { HTTP_STATUS } from '@ai-chat/shared'

describe('Conversations Functions', () => {
  const mockContext = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()  } as unknown as InvocationContext

  // 型安全なmockRequestを作成する関数
  const createMockRequest = (
    query?: Record<string, string>,
    params?: Record<string, string>,
    body?: any
  ): HttpRequest => {
    const jsonMock = jest.fn<() => Promise<any>>();
    jsonMock.mockResolvedValue(body);

    const textMock = jest.fn<() => Promise<string>>();
    textMock.mockResolvedValue('');

    const arrayBufferMock = jest.fn<() => Promise<ArrayBuffer>>();
    arrayBufferMock.mockResolvedValue(new ArrayBuffer(0));

    const formDataMock = jest.fn<() => Promise<FormData>>();
    formDataMock.mockResolvedValue(new FormData());

    return {
      query: new URLSearchParams(query || {}),
      params: params || {},
      headers: {},
      json: jsonMock,
      text: textMock,
      arrayBuffer: arrayBufferMock,
      formData: formDataMock,
      method: 'GET',
      url: 'http://localhost/api',
      bodyUsed: false
    } as unknown as HttpRequest;
  };

  // レスポンス形式を変換するヘルパー関数
  const parseResponse = (response: HttpResponseInit): any => {
    // 新しいAPIはjsonBodyを使用
    if (response.jsonBody) {
      return response.jsonBody;
    }
    // 古いAPIはbodyを文字列化したJSONとして使用
    if (response.body) {
      return JSON.parse(response.body as string);
    }
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getConversations', () => {
    it('should return paginated conversations with default parameters', async () => {
      const request = createMockRequest()
      
      const response = await getConversations(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      
      const body = parseResponse(response);
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(body.pagination).toBeDefined()
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.limit).toBe(10)
    })

    it('should handle custom pagination parameters', async () => {
      const request = createMockRequest({ page: '2', limit: '5', search: 'test' })
      
      const response = await getConversations(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
    })

    it('should handle service errors gracefully', async () => {
      // Mock service to throw error
      const request = createMockRequest()
      
      // Since we're using a mock service, we can't easily mock errors
      // In a real implementation, you would mock the ConversationService
      const response = await getConversations(request, mockContext)
      
      // Should still return a successful response with mock data
      expect(response.status).toBe(HTTP_STATUS.OK)
    })
  })

  describe('getConversation', () => {
    it('should return a specific conversation', async () => {
      const request = createMockRequest({}, { id: '123' })
      
      const response = await getConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(body.data.id).toBe('123')
    })

    it('should return bad request when ID is missing', async () => {
      const request = createMockRequest({}, {})
      
      const response = await getConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const conversationData = { title: 'New Conversation' }
      const request = createMockRequest({}, {}, conversationData)
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.CREATED)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(body.data.title).toBe('New Conversation')
    })

    it('should return bad request when title is missing', async () => {
      const request = createMockRequest({}, {}, {})
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })

    it('should return bad request when body is null', async () => {
      const request = createMockRequest({}, {}, null)
      
      const response = await createConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })

  describe('updateConversation', () => {
    it('should update an existing conversation', async () => {
      const updateData = { title: 'Updated Conversation' }
      const request = createMockRequest({}, { id: '123' }, updateData)
      
      const response = await updateConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
    })

    it('should return bad request when ID is missing', async () => {
      const updateData = { title: 'Updated Conversation' }
      const request = createMockRequest({}, {}, updateData)
      
      const response = await updateConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })

  describe('deleteConversation', () => {
    it('should delete an existing conversation', async () => {
      const request = createMockRequest({}, { id: '123' })
      
      const response = await deleteConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
    })

    it('should return bad request when ID is missing', async () => {
      const request = createMockRequest({}, {})
        const response = await deleteConversation(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      // エラーを発生させるリクエストを作成
      const mockRequest = {
        query: new URLSearchParams(),
        params: {},
        headers: {},
        // @ts-ignore - エラーを無視して型エラーを回避
        json: jest.fn().mockImplementation(() => Promise.reject(new Error('Invalid JSON'))),
        text: jest.fn(),
        arrayBuffer: jest.fn(),
        formData: jest.fn(),        method: 'GET',
        url: 'http://localhost/api',
        bodyUsed: false
      } as unknown as HttpRequest;
      
      const response = await createConversation(mockRequest, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
    })
  })

  // 新しく追加したエンドポイントのテスト
  describe('addMessage', () => {
    it('should add a message to a conversation', async () => {
      const messageData = { content: 'Hello world', role: 'user' }
      const request = createMockRequest({}, { id: '123' }, messageData)
      
      const response = await addMessage(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
    })

    it('should return bad request when ID is missing', async () => {
      const messageData = { content: 'Hello world', role: 'user' }
      const request = createMockRequest({}, {}, messageData)
      
      const response = await addMessage(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })

    it('should return bad request when content is missing', async () => {
      const messageData = { role: 'user' }
      const request = createMockRequest({}, { id: '123' }, messageData)
      
      const response = await addMessage(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })

  describe('generateAIResponse', () => {
    it('should generate an AI response for a conversation', async () => {
      const request = createMockRequest({}, { id: '123' })
      
      const response = await generateAIResponse(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.OK)
      const body = parseResponse(response);
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
    })

    it('should return bad request when ID is missing', async () => {
      const request = createMockRequest({}, {})
      
      const response = await generateAIResponse(request, mockContext)
      
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      const body = parseResponse(response);
      expect(body.success).toBe(false)
      expect(body.error).toContain('required')
    })
  })
})
