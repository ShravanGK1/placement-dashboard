'use client'

import { useEffect, useState } from 'react'
import { Bell, Activity, Sparkles, CheckCircle2, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LiveEvent {
  id: string
  title: string
  description: string
  type: 'job' | 'status' | 'application' | 'system'
  timestamp: string
}

export function LivePlacementTicker() {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource('/api/ds/stream')

      eventSource.onopen = () => {
        setIsLive(true)
      }

      eventSource.addEventListener('broker_event', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          const payload = data.payload
          let newEvent: LiveEvent | null = null

          if (data.topic === 'job.posted') {
            newEvent = {
              id: data.id,
              title: `New Job Opening: ${payload.role}`,
              description: `${payload.company} posted a new drive (${payload.package})`,
              type: 'job',
              timestamp: new Date(payload.timestamp || data.timestamp).toLocaleTimeString(),
            }
          } else if (data.topic === 'application.status_changed') {
            newEvent = {
              id: data.id,
              title: `Application Status Updated`,
              description: `Status updated to "${payload.status.toUpperCase()}"`,
              type: 'status',
              timestamp: new Date(payload.timestamp || data.timestamp).toLocaleTimeString(),
            }
          } else if (data.topic === 'application.submitted') {
            newEvent = {
              id: data.id,
              title: `New Application Received`,
              description: `Candidate applied for ${payload.role} at ${payload.company}`,
              type: 'application',
              timestamp: new Date(payload.timestamp || data.timestamp).toLocaleTimeString(),
            }
          }

          if (newEvent) {
            setEvents((prev) => [newEvent!, ...prev.slice(0, 4)])
          }
        } catch (err) {
          console.error('[LiveTicker] Error parsing event:', err)
        }
      })

      eventSource.onerror = () => {
        setIsLive(false)
      }
    } catch (err) {
      console.error('[LiveTicker] SSE Connection error:', err)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500 text-white rounded-lg">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-semibold text-sm text-foreground">Distributed Live Event Stream (SSE & Pub/Sub)</span>
          {isLive ? (
            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Connecting...
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-mono">SSE Stream Endpoint: /api/ds/stream</span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5 mt-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          Listening for live placement events (new job posts, candidate applications, status updates)...
        </p>
      ) : (
        <div className="space-y-2 mt-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-orange-100 p-2.5 rounded-lg text-xs transition-all duration-300 animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex items-center gap-2.5">
                {ev.type === 'job' && <Briefcase className="w-4 h-4 text-orange-600" />}
                {ev.type === 'status' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {ev.type === 'application' && <Bell className="w-4 h-4 text-blue-600" />}
                <div>
                  <span className="font-semibold text-foreground mr-2">{ev.title}</span>
                  <span className="text-muted-foreground">{ev.description}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{ev.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
