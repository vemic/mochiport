import { jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { 
  generateToken, 
  verifyToken, 
  authenticateRequest, 
  authorizeRequest,
  type AuthenticatedRequest 
} from '../../middleware/auth'
import { HttpRequest, InvocationContext } from '@azure/functions'

// Mock JWT
jest.mock('jsonwebtoken')
const mockedJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth Middleware', () => {
  const mockContext = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  } as unknown as InvocationContext

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    process.env.NODE_ENV = 'test'
  })

  describe('generateToken', () => {
    it('should generate a token with user data', () => {
      const userData = { userId: '123', email: 'test@example.com' }
      const mockToken = 'mock-jwt-token'
      
      mockedJwt.sign.mockReturnValue(mockToken as any)

      const result = generateToken(userData)

      expect(result).toBe(mockToken)
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        userData,
        'test-secret',
        { expiresIn: '24h' }
      )
    })

    it('should use custom expiration time', () => {
      const userData = { userId: '123' }
      const mockToken = 'mock-jwt-token'
      
      mockedJwt.sign.mockReturnValue(mockToken as any)

      generateToken(userData, '1h')

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        userData,
        'test-secret',
        { expiresIn: '1h' }
      )
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const mockPayload = { userId: '123', email: 'test@example.com' }
      const token = 'valid-token'
      
      mockedJwt.verify.mockReturnValue(mockPayload as any)

      const result = verifyToken(token)

      expect(result).toEqual(mockPayload)
      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-secret')
    })

    it('should return null for invalid token', () => {
      const token = 'invalid-token'
      
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = verifyToken(token)

      expect(result).toBeNull()
    })

    it('should return null for expired token', () => {
      const token = 'expired-token'
      
      const error = new Error('Token expired')
      error.name = 'TokenExpiredError'
      mockedJwt.verify.mockImplementation(() => {
        throw error
      })

      const result = verifyToken(token)

      expect(result).toBeNull()
    })
  })

  describe('authenticateRequest', () => {
    const createMockRequest = (authHeader?: string): HttpRequest => ({
      headers: authHeader ? { authorization: authHeader } : {},
      query: new URLSearchParams(),
      params: {},
      json: jest.fn(),
      text: jest.fn(),
      arrayBuffer: jest.fn(),
      formData: jest.fn(),
    } as unknown as HttpRequest)

    it('should authenticate request with valid Bearer token', async () => {
      const mockPayload = { userId: '123', email: 'test@example.com' }
      const request = createMockRequest('Bearer valid-token')
      
      mockedJwt.verify.mockReturnValue(mockPayload as any)

      const result = await authenticateRequest(request, mockContext)

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockPayload)
    })

    it('should fail authentication with missing token', async () => {
      const request = createMockRequest()

      const result = await authenticateRequest(request, mockContext)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No authorization token provided')
    })

    it('should fail authentication with invalid token format', async () => {
      const request = createMockRequest('InvalidFormat token')

      const result = await authenticateRequest(request, mockContext)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid authorization header format')
    })

    it('should fail authentication with invalid token', async () => {
      const request = createMockRequest('Bearer invalid-token')
      
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = await authenticateRequest(request, mockContext)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid or expired token')
    })

    it('should allow development mock token in test environment', async () => {
      const request = createMockRequest('Bearer dev-mock-token')

      const result = await authenticateRequest(request, mockContext)

      expect(result.success).toBe(true)
      expect(result.user).toEqual({
        userId: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User'
      })
    })
  })

  describe('authorizeRequest', () => {
    const createAuthenticatedRequest = (user: any): AuthenticatedRequest => ({
      headers: {},
      query: new URLSearchParams(),
      params: {},
      json: jest.fn(),
      text: jest.fn(),
      arrayBuffer: jest.fn(),
      formData: jest.fn(),
      user
    } as unknown as AuthenticatedRequest)

    it('should authorize user with required role', async () => {
      const user = { userId: '123', roles: ['admin', 'user'] }
      const request = createAuthenticatedRequest(user)

      const result = await authorizeRequest(request, mockContext, ['admin'])

      expect(result.success).toBe(true)
    })

    it('should deny authorization for user without required role', async () => {
      const user = { userId: '123', roles: ['user'] }
      const request = createAuthenticatedRequest(user)

      const result = await authorizeRequest(request, mockContext, ['admin'])

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient permissions')
    })

    it('should authorize when no specific roles required', async () => {
      const user = { userId: '123' }
      const request = createAuthenticatedRequest(user)

      const result = await authorizeRequest(request, mockContext)

      expect(result.success).toBe(true)
    })

    it('should deny authorization for user without roles property when roles required', async () => {
      const user = { userId: '123' }
      const request = createAuthenticatedRequest(user)

      const result = await authorizeRequest(request, mockContext, ['admin'])

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient permissions')
    })

    it('should authorize user with any of the required roles', async () => {
      const user = { userId: '123', roles: ['moderator', 'user'] }
      const request = createAuthenticatedRequest(user)

      const result = await authorizeRequest(request, mockContext, ['admin', 'moderator'])

      expect(result.success).toBe(true)
    })
  })
})
