import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { JobDocument, ApplicationDocument } from '@/lib/models/student'
import { getAuthFromRequest } from '@/lib/server-auth'

const demoJobs: Omit<JobDocument, '_id'>[] = [
  {
    company: 'Tech Corp',
    role: 'Software Engineer',
    description: 'Looking for talented engineers to join our growing team.',
    package: '₹12 LPA',
    cgpa: '3.5+',
    branches: ['CSE', 'IT'],
    deadline: new Date('2026-05-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    company: 'Finance Solutions',
    role: 'Data Analyst',
    description: 'Join our analytics team and make data-driven decisions.',
    package: '₹8 LPA',
    cgpa: '3.0+',
    branches: ['All Branches'],
    deadline: new Date('2026-05-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    company: 'Cloud Systems',
    role: 'DevOps Engineer',
    description: 'Help us build and maintain scalable cloud infrastructure.',
    package: '₹10 LPA',
    cgpa: '3.2+',
    branches: ['CSE', 'IT', 'ECE'],
    deadline: new Date('2026-05-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const jobsCollection = db.collection<JobDocument>('jobs')
  const applicationsCollection = db.collection<ApplicationDocument>('applications')

  const jobsCount = await jobsCollection.countDocuments()
  if (jobsCount === 0) {
    await jobsCollection.insertMany(demoJobs)
  }

  const jobs = await jobsCollection.find({}).sort({ createdAt: -1 }).toArray()

  const studentObjectId = new ObjectId(auth.userId)
  const applications = await applicationsCollection
    .find({ userId: studentObjectId })
    .project({ jobId: 1 })
    .toArray()

  const appliedJobIds = new Set(applications.map((item) => item.jobId.toString()))

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
      applied: appliedJobIds.has(job._id?.toString() || ''),
    })),
  })
}
