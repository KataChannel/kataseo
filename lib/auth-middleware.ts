import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader)

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const payload = verifyJWT(token)

      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Add user info to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      }

      return handler(authenticatedRequest)
    } catch (error) {
      console.error('Authentication middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

export function withRole(allowedRoles: string[]) {
  return function (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user || !allowedRoles.includes(request.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      return handler(request)
    })
  }
}
