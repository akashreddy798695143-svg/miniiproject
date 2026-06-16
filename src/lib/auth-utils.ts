import { createHash, randomBytes } from 'crypto'

// Simple token store for demo (in production, use JWT or sessions)
const tokenStore = new Map<string, { userId: string; expiresAt: number }>()

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'shopzone_salt_2024').digest('hex')
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function createSession(userId: string): string {
  const token = generateToken()
  tokenStore.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  return token
}

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null
  const session = tokenStore.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    tokenStore.delete(token)
    return null
  }
  return session.userId
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  // Also check cookies or query params for convenience
  const url = new URL(request.url)
  return url.searchParams.get('token')
}
