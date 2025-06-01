import { HttpRequest, InvocationContext } from "@azure/functions"
import { HTTP_STATUS } from "@ai-chat/shared"

export interface AuthenticatedRequest extends HttpRequest {
  user?: {
    id: string
    email: string
    name: string
    roles: string[]
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Mock authentication middleware for development
 * In production, replace with actual JWT verification or Azure AD integration
 */
export function authenticateRequest(request: AuthenticatedRequest): void {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    throw new AuthenticationError('Authorization header missing')
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Invalid authorization header format')
  }

  const token = authHeader.substring(7)
  
  // Mock token validation - replace with actual JWT verification
  if (token === 'mock-dev-token') {
    request.user = {
      id: 'user_dev_123',
      email: 'dev@example.com',
      name: 'Development User',
      roles: ['user', 'admin']
    }
  } else {
    throw new AuthenticationError('Invalid token')
  }
}

/**
 * Authorization middleware to check user permissions
 */
export function authorizeRequest(request: AuthenticatedRequest, requiredRoles: string[] = []): void {
  if (!request.user) {
    throw new AuthenticationError('User not authenticated')
  }

  if (requiredRoles.length === 0) {
    return // No specific roles required
  }

  const hasRequiredRole = requiredRoles.some(role => 
    request.user?.roles.includes(role)
  )

  if (!hasRequiredRole) {
    throw new AuthorizationError(`Access denied. Required roles: ${requiredRoles.join(', ')}`)
  }
}

/**
 * Request validation middleware
 */
export function validateContentType(request: HttpRequest, expectedTypes: string[] = ['application/json']): void {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    throw new Error('Content-Type header is required')
  }

  const isValidContentType = expectedTypes.some(type => 
    contentType.toLowerCase().includes(type.toLowerCase())
  )

  if (!isValidContentType) {
    throw new Error(`Invalid Content-Type. Expected: ${expectedTypes.join(', ')}`)
  }
}

/**
 * Rate limiting middleware (basic implementation)
 */
const requestCounts = new Map<string, { count: number, resetTime: number }>()

export function rateLimitRequest(request: HttpRequest, maxRequests: number = 100, windowMs: number = 60000): void {
  const clientId = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const now = Date.now()
  const clientData = requestCounts.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize counter
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    })
    return
  }

  if (clientData.count >= maxRequests) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  clientData.count++
  requestCounts.set(clientId, clientData)
}

/**
 * Request logging middleware
 */
export function logRequest(request: HttpRequest, context: InvocationContext): void {
  const start = Date.now()
  const method = request.method
  const url = request.url
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const clientId = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

  context.log(`[${method}] ${url} - User-Agent: ${userAgent} - Client: ${clientId}`)
  
  // Store start time for response logging
  ;(request as any)._startTime = start
}

/**
 * Response logging middleware
 */
export function logResponse(request: HttpRequest, context: InvocationContext, statusCode: number): void {
  const startTime = (request as any)._startTime
  const duration = startTime ? Date.now() - startTime : 0
  
  context.log(`[${request.method}] ${request.url} - ${statusCode} - ${duration}ms`)
}

/**
 * Error handling middleware
 */
export function handleError(error: unknown, context: InvocationContext) {
  context.error('Request error:', error)

  if (error instanceof AuthenticationError) {
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      jsonBody: {
        success: false,
        error: error.message
      }
    }
  }

  if (error instanceof AuthorizationError) {
    return {
      status: HTTP_STATUS.FORBIDDEN,
      jsonBody: {
        success: false,
        error: error.message
      }
    }
  }

  if (error instanceof Error && error.message.includes('Rate limit')) {
    return {
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
      jsonBody: {
        success: false,
        error: error.message
      }
    }
  }

  if (error instanceof Error && error.message.includes('Content-Type')) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      jsonBody: {
        success: false,
        error: error.message
      }
    }
  }

  return {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    jsonBody: {
      success: false,
      error: 'Internal server error'
    }
  }
}
