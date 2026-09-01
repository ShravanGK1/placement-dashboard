import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { ApplicationDocument, JobDocument } from '@/lib/models/student'
import { UserDocument } from '@/lib/models/user'
import { getAuthFromRequest } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'recruiter') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const jobsCollection = db.collection<JobDocument>('jobs')
  const applicationsCollection = db.collection<ApplicationDocument>('applications')
  const usersCollection = db.collection<UserDocument>('users')

  const recruiterObjectId = new ObjectId(auth.userId)
  const recruiterJobs = await jobsCollection.find({ recruiterId: recruiterObjectId }).toArray()
  const recruiterJobIds = recruiterJobs.map((job) => job._id).filter(Boolean) as ObjectId[]

  let applications: ApplicationDocument[] = []
  if (recruiterJobIds.length) {
    applications = await applicationsCollection
      .find({ jobId: { $in: recruiterJobIds } })
      .sort({ appliedDate: -1 })
      .toArray()
  }

  const today = new Date()
  const stats = {
    activeJobs: recruiterJobs.filter((job) => new Date(job.deadline) >= today).length,
    totalApplications: applications.length,
    candidatesHired: applications.filter((item) => item.status === 'selected').length,
  }

  const usersById = new Map<string, UserDocument>()
  if (applications.length) {
    const userIds = applications.map((item) => item.userId)
    const users = await usersCollection.find({ _id: { $in: userIds } }).toArray()
    users.forEach((user) => usersById.set(user._id?.toString() || '', user))
  }

  const jobsById = new Map(recruiterJobs.map((job) => [job._id?.toString(), job]))

  const recentApplications = applications.slice(0, 5).map((application) => {
    const user = usersById.get(application.userId.toString())
    const job = jobsById.get(application.jobId.toString())

    return {
      id: application._id?.toString(),
      candidate: user?.name || 'Unknown Student',
      role: job?.role || 'Unknown Role',
      status: application.status,
      appliedDate: application.appliedDate,
      cgpa:
        user?.cgpa !== undefined && user?.cgpa !== null
          ? String(user.cgpa)
          : '-',
    }
  })

  return NextResponse.json({ stats, recentApplications })
}
