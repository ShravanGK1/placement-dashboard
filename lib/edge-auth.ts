export interface AuthTokenPayload {
  userId: string
  name: string
  email: string
  role: 'student' | 'recruiter' | 'admin'
}

export const AUTH_COOKIE_NAME = 'placement_auth'

export async function verifyAuthTokenEdge(
  token: string,
  secret?: string
): Promise<AuthTokenPayload | null> {
  const jwtSecret = secret || process.env.JWT_SECRET
  if (!jwtSecret || !token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Base64url to binary Uint8Array
    const base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const sigBytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i)
    }

    const data = enc.encode(`${headerB64}.${payloadB64}`)
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data)
    if (!isValid) return null

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const decoded = JSON.parse(payloadJson)

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null
    }

    if (!decoded.userId || !decoded.role) {
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
