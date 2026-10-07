import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserRole } from '@/lib/models/user'

export interface AuthTokenPayload {
  userId: string
  name: string
  email: string
  role: UserRole
}

export const AUTH_COOKIE_NAME = 'placement_auth'

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Add it to your .env file.')
  }
  return secret
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & AuthTokenPayload
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.name) {
      return null
    }

    return {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    }
  } catch {
    return null
  }
}
