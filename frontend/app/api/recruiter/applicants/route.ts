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

  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') || '').trim().toLowerCase()
  const statusFilter = (searchParams.get('status') || 'all').trim().toLowerCase()

  const db = await getDb()
  const jobsCollection = db.collection<JobDocument>('jobs')
  const applicationsCollection = db.collection<ApplicationDocument>('applications')
  const usersCollection = db.collection<UserDocument>('users')

  const recruiterObjectId = new ObjectId(auth.userId)
  const recruiterJobs = await jobsCollection.find({ recruiterId: recruiterObjectId }).toArray()
  const recruiterJobIds = recruiterJobs.map((job) => job._id).filter(Boolean) as ObjectId[]

  if (!recruiterJobIds.length) {
    return NextResponse.json({ applicants: [] })
  }

  const applicationFilter: {
    jobId: { $in: ObjectId[] }
    status?: 'applied' | 'shortlisted' | 'selected' | 'rejected'
  } = {
    jobId: { $in: recruiterJobIds },
  }

  if (statusFilter !== 'all' && ['applied', 'shortlisted', 'selected', 'rejected'].includes(statusFilter)) {
    applicationFilter.status = statusFilter as 'applied' | 'shortlisted' | 'selected' | 'rejected'
  }

  const applications = await applicationsCollection.find(applicationFilter).sort({ appliedDate: -1 }).toArray()
  const userIds = applications.map((item) => item.userId)
  const students = userIds.length
    ? await usersCollection
        .find({ _id: { $in: userIds }, role: 'student' })
        .project({ password: 0 } as { password: 0 })
        .toArray()
    : []

  const jobsById = new Map(recruiterJobs.map((job) => [job._id?.toString(), job]))
  const studentsById = new Map(students.map((student) => [student._id?.toString(), student]))

  const applicants = applications
    .map((application) => {
      const student = studentsById.get(application.userId.toString())
      const job = jobsById.get(application.jobId.toString())
      if (!student || !job) {
        return null
      }

      return {
        id: application._id?.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone || '-',
        role: job.role,
        cgpa: student.cgpa !== undefined && student.cgpa !== null ? String(student.cgpa) : '-',
        branch: student.branch || '-',
        status: application.status,
        appliedDate: application.appliedDate,
        resume: student.resume || null,
      }
    })
    .filter(Boolean)
    .filter((item) => {
      if (!item) {
        return false
      }
      if (!query) {
        return true
      }
      return item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query)
    })

  return NextResponse.json({ applicants })
}
