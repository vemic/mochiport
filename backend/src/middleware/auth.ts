import jwt from 'jsonwebtoken'
import type { HttpRequest, InvocationContext } from '@azure/functions'

export interface AuthResult {
  success: boolean
  user?: any
  error?: string
}

export interface AuthRequest extends HttpRequest {
  user?: any
}

export const generateToken = (userData: any, expiresIn: string = '24h'): string => {
  const secret = process.env.JWT_SECRET || 'test-secret'
  return jwt.sign(userData, secret, { expiresIn })
}

export const verifyToken = (token: string): any | null => {
  try {
    const secret = process.env.JWT_SECRET || 'test-secret'
    return jwt.verify(token, secret) as any
  } catch (error) {
    return null
  }
}

export const authenticateRequest = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<AuthResult> => {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return {
        success: false,
        error: 'No authorization token provided'
      }
    }

    // Handle Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Invalid authorization header format'
      }
    }

    const token = authHeader.substring(7)    // Development mock token
    if (process.env.NODE_ENV === 'test' && token === 'dev-mock-token') {
      return {
        success: true,
        user: {
          userId: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Development User',
          roles: ['admin', 'user']
        }
      }
    }

    // Verify JWT token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return {
        success: false,
        error: 'Invalid or expired token'
      }
    }

    return {
      success: true,
      user: decoded
    }
  } catch (error) {
    context.log('Authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}

export const authorizeRequest = async (
  request: AuthRequest,
  context: InvocationContext,
  requiredRoles?: string[]
): Promise<AuthResult> => {
  try {
    let authResult: AuthResult

    // Check if request already has authenticated user (for testing)
    if (request.user) {
      authResult = {
        success: true,
        user: request.user
      }    } else {
      // First authenticate
      authResult = await authenticateRequest(request as HttpRequest, context)
      
      if (!authResult.success) {
        return authResult
      }
    }

    // If no specific roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return authResult
    }

    // Check if user has required roles
    const user = authResult.user
    const userRoles = user?.roles || []

    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    return authResult
  } catch (error) {
    context.log('Authorization error:', error)
    return {
      success: false,
      error: 'Authorization failed'
    }
  }
}