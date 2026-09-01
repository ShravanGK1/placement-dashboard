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
  const applications = await applicationsCollection
    .find({ userId: studentObjectId })
    .sort({ appliedDate: -1 })
    .toArray()

  const jobIds = applications.map((item) => item.jobId)
  const jobs = jobIds.length
    ? await jobsCollection.find({ _id: { $in: jobIds } }).toArray()
    : []

  const jobsById = new Map(jobs.map((job) => [job._id?.toString(), job]))

  const result = applications
    .map((application) => {
      const job = jobsById.get(application.jobId.toString())
      if (!job) {
        return null
      }

      return {
        id: application._id?.toString(),
        company: job.company,
        role: job.role,
        package: job.package,
        status: application.status,
        appliedDate: application.appliedDate,
      }
    })
    .filter(Boolean)

  return NextResponse.json({ applications: result })
}
