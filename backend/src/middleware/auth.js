import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'placement-cell-super-secret-key-change-in-prod'
export const AUTH_COOKIE_NAME = 'placement_token'

export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function requireAuth(roles = []) {
  return (req, res, next) => {
    const token = req.cookies[AUTH_COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (roles.length > 0 && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' })
    }

    req.user = decoded
    next()
  }
}
