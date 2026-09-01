import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from '@/lib/auth'
import { UserDocument } from '@/lib/models/user'
import { getDb } from '@/lib/mongodb'

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsedBody = loginSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, password } = parsedBody.data
    const normalizedEmail = email.toLowerCase()

    const db = await getDb()
    const users = db.collection<UserDocument>('users')
    const user = await users.findOne({ email: normalizedEmail })

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const safeUser = {
      id: user._id?.toString() || '',
      name: user.name,
      email: user.email,
      role: user.role,
    }

    const token = signAuthToken({
      userId: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
    })

    const response = NextResponse.json({ message: 'Logged in successfully', user: safeUser })
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions)

    return response
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}
