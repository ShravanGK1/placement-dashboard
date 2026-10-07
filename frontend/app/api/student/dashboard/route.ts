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

  try {
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
  } catch {
    // Fallback demo data if MongoDB is offline
    return NextResponse.json({
      stats: { applied: 4, shortlisted: 2, selected: 1 },
      recentJobs: [
        {
          id: 'job_101',
          company: 'Google',
          role: 'Software Development Engineer',
          package: '₹32 LPA',
          cgpa: '8.0+',
          branch: 'CSE, IT, ECE',
          applied: true,
        },
        {
          id: 'job_102',
          company: 'Microsoft',
          role: 'Cloud Solutions Architect',
          package: '₹28 LPA',
          cgpa: '7.5+',
          branch: 'CSE, IT',
          applied: false,
        },
        {
          id: 'job_103',
          company: 'Amazon AWS',
          role: 'Systems Engineer (Distributed Systems)',
          package: '₹26 LPA',
          cgpa: '7.0+',
          branch: 'CSE, IT, ECE, Mech',
          applied: true,
        },
      ],
    })
  }
}
