import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getDb } from '@/lib/mongodb'
import { JobDocument } from '@/lib/models/student'
import { getAuthFromRequest } from '@/lib/server-auth'

const createJobSchema = z.object({
  company: z.string().trim().min(2, 'Company name is required'),
  role: z.string().trim().min(2, 'Job title is required'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  package: z.string().trim().min(1, 'Package is required'),
  cgpa: z.string().trim().min(1, 'Minimum CGPA is required'),
  branches: z.array(z.string().trim().min(1)).min(1, 'Select at least one branch'),
  deadline: z.string().datetime().or(z.string().date()),
})

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'recruiter') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const jobsCollection = db.collection<JobDocument>('jobs')

  const recruiterObjectId = new ObjectId(auth.userId)
  const jobs = await jobsCollection
    .find({ recruiterId: recruiterObjectId })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({
    jobs: jobs.map((job) => ({
      id: job._id?.toString(),
      company: job.company,
      role: job.role,
      description: job.description,
      package: job.package,
      cgpa: job.cgpa,
      branches: job.branches,
      deadline: job.deadline,
      createdAt: job.createdAt,
    })),
  })
}

export async function POST(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'recruiter') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Invalid job payload' },
      { status: 400 }
    )
  }

  const db = await getDb()
  const jobsCollection = db.collection<JobDocument>('jobs')
  const now = new Date()
  const deadlineDate = new Date(parsed.data.deadline)

  const recruiterObjectId = new ObjectId(auth.userId)

  const result = await jobsCollection.insertOne({
    recruiterId: recruiterObjectId,
    company: parsed.data.company,
    role: parsed.data.role,
    description: parsed.data.description,
    package: parsed.data.package,
    cgpa: parsed.data.cgpa,
    branches: parsed.data.branches,
    deadline: deadlineDate,
    createdAt: now,
    updatedAt: now,
  })

  // Publish event to Distributed System Pub/Sub Broker
  try {
    const { broker } = await import('@/lib/ds/message-broker')
    await broker.publish('job.posted', {
      jobId: result.insertedId.toString(),
      company: parsed.data.company,
      role: parsed.data.role,
      package: parsed.data.package,
      branches: parsed.data.branches,
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error('Failed to publish job.posted event:', err)
  }

  return NextResponse.json(
    {
      message: 'Job posted successfully',
      jobId: result.insertedId.toString(),
    },
    { status: 201 }
  )
}
