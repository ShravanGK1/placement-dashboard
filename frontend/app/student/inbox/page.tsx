'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Inbox, Video, Calendar, Clock, ArrowRight, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/student/jobs', icon: '💼' },
  { label: 'My Applications', href: '/student/applications', icon: '📋' },
  { label: 'Inbox & Invites', href: '/student/inbox', icon: '📥' },
  { label: 'Profile', href: '/student/profile', icon: '👤' },
]

interface InterviewInvite {
  id: string
  company: string
  role: string
  scheduledAt: string
  roomId: string
  notes?: string
  status: string
  joinUrl: string
}

export default function StudentInboxPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<InterviewInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [customRoomId, setCustomRoomId] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/student/interviews', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load interview invites')
        }
        const data = await response.json()
        if (!ignore) {
          setInterviews(data.interviews || [])
        }
      } catch {
        if (!ignore) {
          setError('Unable to load interview invitations.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchInterviews()

    return () => {
      ignore = true
    }
  }, [])

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customRoomId.trim()) return

    // Extract room ID if user pasted full URL
    let targetRoom = customRoomId.trim()
    if (targetRoom.includes('/interview/')) {
      targetRoom = targetRoom.split('/interview/')[1] || targetRoom
    }

    router.push(`/interview/${targetRoom}`)
  }

  return (
    <DashboardLayout navItems={navItems} title="Inbox & Interview Invites" userInitial="S">
      <div className="space-y-6 max-w-6xl">
        {/* Top Quick Join Banner */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-600 text-white rounded-lg">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Join Interview via Room ID or Invite Link</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Received a direct WebRTC Room ID or link from a recruiter? Enter it below to join the video session instantly.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinCustomRoom} className="flex gap-2 flex-col sm:flex-row">
              <Input
                placeholder="Enter Room ID (e.g. meet_a7b9c2) or paste invite URL..."
                value={customRoomId}
                onChange={(e) => setCustomRoomId(e.target.value)}
                className="flex-1 bg-white"
              />
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shrink-0">
                Join WebRTC Meet <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Scheduled Interview Invites List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-orange-600" />
                  Scheduled Interview Invitations
                </CardTitle>
                <CardDescription>
                  Your scheduled virtual interview invites received directly from recruiters.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {interviews.length} {interviews.length === 1 ? 'Invite' : 'Invites'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading interview invitations...
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <Sparkles className="w-12 h-12 text-orange-500/40 mx-auto mb-3" />
                <h3 className="font-semibold text-base text-foreground mb-1">No Scheduled Interviews Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  When a recruiter shortlists your application and schedules an interview, your invite link and Room ID will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((invite) => {
                  const scheduleDate = new Date(invite.scheduledAt)
                  const isUpcoming = scheduleDate.getTime() > Date.now()

                  return (
                    <div
                      key={invite.id}
                      className="p-5 border border-border rounded-xl bg-white hover:border-orange-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-foreground">{invite.company}</h3>
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            {invite.role}
                          </Badge>
                          {isUpcoming ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                              Upcoming
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Completed / Past
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-orange-600" />
                            {scheduleDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            {scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            Room ID: {invite.roomId}
                          </span>
                        </div>

                        {invite.notes && (
                          <div className="flex items-start gap-1.5 bg-gray-50 p-2.5 rounded-lg text-xs text-muted-foreground border border-gray-100">
                            <MessageSquare className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <span><strong className="text-foreground">Recruiter Note:</strong> {invite.notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                        <Link href={invite.joinUrl}>
                          <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs gap-1.5 shadow-sm">
                            <Video className="w-4 h-4" />
                            Join WebRTC Room
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
