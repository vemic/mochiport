import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase.js';
import { HTTP_STATUS } from '@mochiport/shared'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email?: string
  }
}

/**
 * JWT トークンを生成（Supabaseが自動的に処理するため、通常は不要）
 */
export const generateToken = (_userId: string): string => {
  // Supabaseが自動的にJWTトークンを管理するため、
  // このメソッドは互換性のためのプレースホルダー
  throw new Error('Use Supabase auth.signIn() instead of generateToken()')
}

/**
 * JWT トークンを検証（Supabaseが自動的に処理）
 */
export const verifyToken = async (token: string): Promise<{ userId: string; email?: string } | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * 認証ミドルウェア - Authorizationヘッダーからトークンを取得して検証
 */
export const authenticateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Authorization header required'
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const user = await verifyToken(token)

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid or expired token'
      })
      return
    }

    // リクエストにユーザー情報を追加
    (req as AuthenticatedRequest).user = {
      id: user.userId,
      email: user.email
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Authentication failed'
    })
  }
}

/**
 * 認可ミドルウェア - 特定のリソースへのアクセス権限を確認
 */
export const authorizeRequest = (requiredPermissions?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest
      
      // 基本的な認証チェック
      if (!authenticatedReq.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'User not authenticated'
        })
        return
      }

      // 将来的な拡張のためのパーミッション確認
      // 現在は基本的な認証のみ実装
      if (requiredPermissions && requiredPermissions.length > 0) {
        // TODO: ユーザーの権限をSupabaseから取得して確認
        console.log(`Permission check required for: ${requiredPermissions.join(', ')}`)
      }

      next()
    } catch (error) {
      console.error('Authorization error:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Authorization failed'
      })
    }
  }
}

/**
 * オプション認証ミドルウェア - 認証は必須ではないが、トークンがあれば検証
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const user = await verifyToken(token)

      if (user) {
        (req as AuthenticatedRequest).user = {
          id: user.userId,
          email: user.email
        }
      }
    }

    next()
  } catch (error) {
    console.error('Optional authentication error:', error)
    // オプション認証なのでエラーでも続行
    next()
  }
}

/**
 * ユーザーIDを取得するヘルパー関数
 */
export const getUserId = (req: Request): string | null => {
  const authenticatedReq = req as AuthenticatedRequest
  return authenticatedReq.user?.id || null
}

/**
 * ユーザー情報を取得するヘルパー関数
 */
export const getUser = (req: Request): { id: string; email?: string } | null => {
  const authenticatedReq = req as AuthenticatedRequest
  return authenticatedReq.user || null
}
