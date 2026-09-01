import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from '@/lib/auth'
import { UserDocument, UserRole } from '@/lib/models/user'
import { getDb } from '@/lib/mongodb'

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'recruiter', 'admin']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsedBody = signupSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, password, role } = parsedBody.data
    const normalizedEmail = email.toLowerCase()

    const db = await getDb()
    const users = db.collection<UserDocument>('users')

    await users.createIndex({ email: 1 }, { unique: true })

    const existingUser = await users.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date()

    const result = await users.insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role as UserRole,
      createdAt: now,
      updatedAt: now,
    })

    const user = {
      id: result.insertedId.toString(),
      name,
      email: normalizedEmail,
      role,
    }

    const token = signAuthToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    )
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions)

    return response
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}
