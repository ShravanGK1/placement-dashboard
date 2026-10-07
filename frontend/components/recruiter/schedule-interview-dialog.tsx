'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, CheckCircle2, Video } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ScheduleInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  candidateName: string
  candidateRole: string
  onScheduled?: () => void
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicationId,
  candidateName,
  candidateRole,
  onScheduled,
}: ScheduleInterviewDialogProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scheduledResult, setScheduledResult] = useState<{
    roomId: string
    joinUrl: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) {
      setError('Please select both date and time')
      return
    }

    setLoading(true)
    setError('')

    try {
      const scheduledDateTime = new Date(`${date}T${time}`)
      const response = await fetch('/api/recruiter/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          scheduledAt: scheduledDateTime.toISOString(),
          notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule interview')
      }

      setScheduledResult({
        roomId: data.roomId,
        joinUrl: data.joinUrl,
      })

      if (onScheduled) {
        onScheduled()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error scheduling interview')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setScheduledResult(null)
    setDate('')
    setTime('10:00')
    setNotes('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-600" />
            Schedule WebRTC Interview
          </DialogTitle>
          <DialogDescription>
            Schedule a virtual interview meeting for <span className="font-semibold text-foreground">{candidateName}</span> ({candidateRole}).
          </DialogDescription>
        </DialogHeader>

        {scheduledResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Interview Scheduled Successfully!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  An invitation and WebRTC join link have been delivered to the student’s portal inbox.
                </p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Room ID:</span>
                <span className="text-orange-400 font-bold">{scheduledResult.roomId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Join URL:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{scheduledResult.joinUrl}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <a href={scheduledResult.joinUrl} target="_blank" rel="noreferrer">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white text-xs gap-1">
                  <Video className="w-4 h-4" />
                  Join Room Now
                </Button>
              </a>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Date</label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Time</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Recruiter Notes / Instructions (Optional)</label>
              <Input
                placeholder="e.g. Please bring your resume and prepare for technical DSA round."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule & Send Invite'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
