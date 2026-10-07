import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getDb } from '@/lib/mongodb'
import { UserDocument } from '@/lib/models/user'
import { getAuthFromRequest } from '@/lib/server-auth'

const updateProfileSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().default(''),
  cgpa: z
    .union([z.string(), z.number(), z.null()])
    .transform((value) => {
      if (value === null || value === '') {
        return null
      }
      const parsed = typeof value === 'number' ? value : Number(value)
      return Number.isFinite(parsed) ? parsed : null
    })
    .refine((value) => value === null || (value >= 0 && value <= 10), {
      message: 'CGPA must be between 0 and 10',
    }),
  branch: z.string().trim().optional().default(''),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  resume: z.string().trim().nullable().optional().default(null),
})

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const users = db.collection<UserDocument>('users')

  const user = await users.findOne({ _id: new ObjectId(auth.userId) })
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      cgpa: user.cgpa ?? null,
      branch: user.branch || '',
      skills: user.skills || [],
      resume: user.resume || null,
    },
  })
}

export async function PUT(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Invalid profile data' },
      { status: 400 }
    )
  }

  const db = await getDb()
  const users = db.collection<UserDocument>('users')

  const normalizedEmail = parsed.data.email.toLowerCase()

  const emailOwner = await users.findOne({
    email: normalizedEmail,
    _id: { $ne: new ObjectId(auth.userId) },
  })

  if (emailOwner) {
    return NextResponse.json({ message: 'Email is already in use' }, { status: 409 })
  }

  await users.updateOne(
    { _id: new ObjectId(auth.userId) },
    {
      $set: {
        name: parsed.data.name,
        email: normalizedEmail,
        phone: parsed.data.phone,
        cgpa: parsed.data.cgpa,
        branch: parsed.data.branch,
        skills: parsed.data.skills,
        resume: parsed.data.resume,
        updatedAt: new Date(),
      },
    }
  )

  return NextResponse.json({ message: 'Profile updated successfully' })
}
