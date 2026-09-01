'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { LivePlacementTicker } from '@/components/ds/live-placement-ticker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Briefcase, TrendingUp } from 'lucide-react'
import Link from 'next/link'


const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/student/jobs', icon: '💼' },
  { label: 'My Applications', href: '/student/applications', icon: '📋' },
  { label: 'Inbox & Invites', href: '/student/inbox', icon: '📥' },
  { label: 'Profile', href: '/student/profile', icon: '👤' },
]


interface DashboardResponse {
  stats: {
    applied: number
    shortlisted: number
    selected: number
  }
  recentJobs: Array<{
    id: string
    company: string
    role: string
    package: string
    cgpa: string
    branch: string
    applied: boolean
  }>
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      try {
        const response = await fetch('/api/student/dashboard', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load dashboard')
        }
        const json = await response.json()
        if (!ignore) {
          setData(json)
        }
      } catch {
        if (!ignore) {
          setError('Unable to load dashboard data.')
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  const stats = useMemo(
    () => [
      { label: 'Applied', value: String(data?.stats.applied ?? 0), color: 'bg-blue-50 text-blue-600' },
      { label: 'Shortlisted', value: String(data?.stats.shortlisted ?? 0), color: 'bg-yellow-50 text-yellow-600' },
      { label: 'Selected', value: String(data?.stats.selected ?? 0), color: 'bg-green-50 text-green-600' },
    ],
    [data]
  )


  return (

    <DashboardLayout navItems={navItems} title="Dashboard" userInitial="S">
      <div className="space-y-6">
        <LivePlacementTicker />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}



        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className={`p-3 rounded-lg ${stat.color} w-fit mb-3`}>
                  {stat.label === 'Applied' && <FileText className="w-5 h-5" />}
                  {stat.label === 'Shortlisted' && <TrendingUp className="w-5 h-5" />}
                  {stat.label === 'Selected' && <Briefcase className="w-5 h-5" />}
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Job Postings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-600" />
                Recent Job Postings
              </CardTitle>
              <Link href="/student/jobs">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recentJobs || []).map((job) => (
                <div key={job.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-orange-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{job.company}</h3>
                      <Badge variant="secondary" className="text-xs">{job.branch}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{job.role}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Package: <span className="font-semibold text-green-600">{job.package}</span></span>
                      <span>CGPA: {job.cgpa}</span>
                    </div>
                  </div>
                  <Link href="/student/jobs">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white" disabled={job.applied}>
                      {job.applied ? 'Applied' : 'Easy Apply'}
                    </Button>
                  </Link>
                </div>
              ))}

              {!data?.recentJobs?.length ? (
                <p className="text-sm text-muted-foreground">No jobs available right now.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
