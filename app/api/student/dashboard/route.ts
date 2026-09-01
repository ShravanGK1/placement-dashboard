import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { ApplicationDocument, JobDocument } from '@/lib/models/student'
import { getAuthFromRequest } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const applicationsCollection = db.collection<ApplicationDocument>('applications')
  const jobsCollection = db.collection<JobDocument>('jobs')

  const studentObjectId = new ObjectId(auth.userId)
  const applications = await applicationsCollection.find({ userId: studentObjectId }).toArray()

  const stats = {
    applied: applications.filter((item) => item.status === 'applied').length,
    shortlisted: applications.filter((item) => item.status === 'shortlisted').length,
    selected: applications.filter((item) => item.status === 'selected').length,
  }

  const latestJobs = await jobsCollection.find({}).sort({ createdAt: -1 }).limit(3).toArray()
  const appliedJobIds = new Set(applications.map((item) => item.jobId.toString()))

  return NextResponse.json({
    stats,
    recentJobs: latestJobs.map((job) => ({
      id: job._id?.toString(),
      company: job.company,
      role: job.role,
      package: job.package,
      cgpa: job.cgpa,
      branch: job.branches.join(', '),
      applied: appliedJobIds.has(job._id?.toString() || ''),
    })),
  })
}
