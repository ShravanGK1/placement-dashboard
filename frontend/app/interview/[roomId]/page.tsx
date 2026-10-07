'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Video, ShieldCheck } from 'lucide-react'
import P2PWebRTCRoom from '@/components/ds/p2p-webrtc-room'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default function InterviewRoomPage({ params }: PageProps) {
  const { roomId } = use(params)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student/inbox">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-500" />
            <h1 className="font-semibold text-lg text-slate-100">Live Virtual Interview Room</h1>
            <span className="text-xs bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
              ID: {roomId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>WebRTC P2P DataChannel Encrypted</span>
        </div>
      </header>

      {/* Main Video Room Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col">
        <P2PWebRTCRoom initialRoomId={roomId} autoJoin={true} />
      </main>
    </div>
  )
}
