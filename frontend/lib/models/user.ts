import { ObjectId } from 'mongodb'

export type UserRole = 'student' | 'recruiter' | 'admin'

export interface UserDocument {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  cgpa?: number | null
  branch?: string
  skills?: string[]
  resume?: string | null
  createdAt: Date
  updatedAt: Date
}

