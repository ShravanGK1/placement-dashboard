import { ObjectId } from 'mongodb'

export interface InterviewDocument {
  _id?: ObjectId
  applicationId: ObjectId
  jobId: ObjectId
  studentId: ObjectId
  recruiterId: ObjectId
  company: string
  role: string
  scheduledAt: Date
  roomId: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
