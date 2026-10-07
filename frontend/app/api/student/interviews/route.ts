import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { InterviewDocument } from '@/lib/models/interview'
import { getAuthFromRequest } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const interviewsCollection = db.collection<InterviewDocument>('interviews')

  const studentObjectId = new ObjectId(auth.userId)
  const interviews = await interviewsCollection
    .find({ studentId: studentObjectId })
    .sort({ scheduledAt: -1 })
    .toArray()

  return NextResponse.json({
    interviews: interviews.map((item) => ({
      id: item._id?.toString(),
      company: item.company,
      role: item.role,
      scheduledAt: item.scheduledAt,
      roomId: item.roomId,
      notes: item.notes || '',
      status: item.status,
      joinUrl: `/interview/${item.roomId}`,
    })),
  })
}
