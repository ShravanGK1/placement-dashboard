import { ObjectId } from 'mongodb'

export interface JobDocument {
  _id?: ObjectId
  recruiterId?: ObjectId
  company: string
  role: string
  description: string
  package: string
  cgpa: string
  branches: string[]
  deadline: Date
  createdAt: Date
  updatedAt: Date
}

export type ApplicationStatus = 'applied' | 'shortlisted' | 'selected' | 'rejected'

export interface ApplicationDocument {
  _id?: ObjectId
  userId: ObjectId
  jobId: ObjectId
  status: ApplicationStatus
  appliedDate: Date
  updatedAt: Date
}
