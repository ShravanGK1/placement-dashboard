import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { ApplicationDocument, JobDocument } from '@/lib/models/student'
import { getAuthFromRequest } from '@/lib/server-auth'

interface Params {
  params: Promise<{ jobId: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await params

  if (!ObjectId.isValid(jobId)) {
    return NextResponse.json({ message: 'Invalid job id' }, { status: 400 })
  }

  const db = await getDb()
  const jobsCollection = db.collection<JobDocument>('jobs')
  const applicationsCollection = db.collection<ApplicationDocument>('applications')

  const jobObjectId = new ObjectId(jobId)
  const studentObjectId = new ObjectId(auth.userId)
  const now = new Date()

  const job = await jobsCollection.findOne({ _id: jobObjectId })
  if (!job) {
    return NextResponse.json({ message: 'Job not found' }, { status: 404 })
  }

  await applicationsCollection.createIndex({ userId: 1, jobId: 1 }, { unique: true })

  await applicationsCollection.updateOne(
    { userId: studentObjectId, jobId: jobObjectId },
    {
      $set: {
        status: 'applied',
        updatedAt: now,
      },
      $setOnInsert: {
        appliedDate: now,
      },
    },
    { upsert: true }
  )

  // Publish event to Distributed System Pub/Sub Broker
  try {
    const { broker } = await import('@/lib/ds/message-broker')
    await broker.publish('application.submitted', {
      jobId: jobId,
      company: job.company,
      role: job.role,
      studentId: auth.userId,
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error('Failed to publish application.submitted event:', err)
  }

  return NextResponse.json({ message: 'Application submitted successfully' })
}

