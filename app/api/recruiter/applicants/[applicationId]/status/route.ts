import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getDb } from '@/lib/mongodb'
import { ApplicationDocument, JobDocument } from '@/lib/models/student'
import { getAuthFromRequest } from '@/lib/server-auth'

const updateStatusSchema = z.object({
  status: z.enum(['applied', 'shortlisted', 'selected', 'rejected']),
})

interface Params {
  params: Promise<{ applicationId: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'recruiter') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { applicationId } = await params
  if (!ObjectId.isValid(applicationId)) {
    return NextResponse.json({ message: 'Invalid application id' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = updateStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Invalid status' },
      { status: 400 }
    )
  }

  const db = await getDb()
  const applicationsCollection = db.collection<ApplicationDocument>('applications')
  const jobsCollection = db.collection<JobDocument>('jobs')

  const applicationObjectId = new ObjectId(applicationId)
  const application = await applicationsCollection.findOne({ _id: applicationObjectId })
  if (!application) {
    return NextResponse.json({ message: 'Application not found' }, { status: 404 })
  }

  const job = await jobsCollection.findOne({ _id: application.jobId })
  if (!job || !job.recruiterId || job.recruiterId.toString() !== auth.userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await applicationsCollection.updateOne(
    { _id: applicationObjectId },
    {
      $set: {
        status: parsed.data.status,
        updatedAt: new Date(),
      },
    }
  )

  // Publish event to Distributed System Pub/Sub Broker
  try {
    const { broker } = await import('@/lib/ds/message-broker')
    await broker.publish('application.status_changed', {
      applicationId: applicationObjectId.toString(),
      jobId: application.jobId.toString(),
      studentId: application.userId.toString(),
      status: parsed.data.status,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Failed to publish application.status_changed event:', err)
  }

  return NextResponse.json({ message: 'Status updated successfully' })
}

