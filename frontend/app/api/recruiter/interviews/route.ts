import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getDb } from '@/lib/mongodb'
import { ApplicationDocument, JobDocument } from '@/lib/models/student'
import { InterviewDocument } from '@/lib/models/interview'
import { getAuthFromRequest } from '@/lib/server-auth'

const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  scheduledAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'recruiter') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = scheduleInterviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Invalid request body' },
      { status: 400 }
    )
  }

  const { applicationId, scheduledAt, notes } = parsed.data

  if (!ObjectId.isValid(applicationId)) {
    return NextResponse.json({ message: 'Invalid application ID' }, { status: 400 })
  }

  const db = await getDb()
  const applicationsCollection = db.collection<ApplicationDocument>('applications')
  const jobsCollection = db.collection<JobDocument>('jobs')
  const interviewsCollection = db.collection<InterviewDocument>('interviews')

  const applicationObjectId = new ObjectId(applicationId)
  const application = await applicationsCollection.findOne({ _id: applicationObjectId })
  if (!application) {
    return NextResponse.json({ message: 'Application not found' }, { status: 404 })
  }

  const job = await jobsCollection.findOne({ _id: application.jobId })
  if (!job || !job.recruiterId || job.recruiterId.toString() !== auth.userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const scheduledDate = new Date(scheduledAt)
  const roomId = `meet_${applicationId.slice(-6)}_${Math.random().toString(36).substring(2, 7)}`
  const now = new Date()

  // Update application status to shortlisted if applied
  if (application.status === 'applied') {
    await applicationsCollection.updateOne(
      { _id: applicationObjectId },
      { $set: { status: 'shortlisted', updatedAt: now } }
    )
  }

  // Insert interview record
  const result = await interviewsCollection.insertOne({
    applicationId: applicationObjectId,
    jobId: application.jobId,
    studentId: application.userId,
    recruiterId: new ObjectId(auth.userId),
    company: job.company,
    role: job.role,
    scheduledAt: scheduledDate,
    roomId,
    notes,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  })

  // Publish event to DS Message Broker
  try {
    const { broker } = await import('@/lib/ds/message-broker')
    await broker.publish('application.status_changed', {
      applicationId: applicationId,
      jobId: application.jobId.toString(),
      studentId: application.userId.toString(),
      status: 'shortlisted',
      interviewId: result.insertedId.toString(),
      roomId,
      company: job.company,
      role: job.role,
      scheduledAt: scheduledDate.toISOString(),
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error('Failed to publish interview event:', err)
  }

  return NextResponse.json(
    {
      message: 'Interview scheduled successfully',
      interviewId: result.insertedId.toString(),
      roomId,
      joinUrl: `/interview/${roomId}`,
    },
    { status: 201 }
  )
}
