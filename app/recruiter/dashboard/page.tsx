'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { LivePlacementTicker } from '@/components/ds/live-placement-ticker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'


const navItems = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: '📊' },
  { label: 'Post Job', href: '/recruiter/post-job', icon: '➕' },
  { label: 'Applicants', href: '/recruiter/applicants', icon: '👥' },
]

interface RecruiterDashboardResponse {
  stats: {
    activeJobs: number
    totalApplications: number
    candidatesHired: number
  }
  recentApplications: Array<{
    id: string
    candidate: string
    role: string
    status: string
    appliedDate: string
    cgpa: string
  }>
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-700'
    case 'shortlisted':
      return 'bg-yellow-100 text-yellow-700'
    case 'selected':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function RecruiterDashboard() {
  const [data, setData] = useState<RecruiterDashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/recruiter/dashboard', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load recruiter dashboard')
        }
        const result = await response.json()
        if (!ignore) {
          setData(result)
        }
      } catch {
        if (!ignore) {
          setError('Unable to load dashboard data.')
        }
      }
    }

    fetchDashboard()

    return () => {
      ignore = true
    }
  }, [])

  const stats = useMemo(
    () => [
      { label: 'Active Jobs', value: String(data?.stats.activeJobs ?? 0), color: 'bg-blue-50 text-blue-600' },
      {
        label: 'Total Applications',
        value: String(data?.stats.totalApplications ?? 0),
        color: 'bg-purple-50 text-purple-600',
      },
      {
        label: 'Candidates Hired',
        value: String(data?.stats.candidatesHired ?? 0),
        color: 'bg-green-50 text-green-600',
      },
    ],
    [data]
  )

  return (
    <DashboardLayout navItems={navItems} title="Dashboard" userInitial="R">
      <div className="space-y-6">
        <LivePlacementTicker />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className={`p-3 rounded-lg ${stat.color} w-fit mb-3`}>
                  {stat.label === 'Active Jobs' && <Briefcase className="w-5 h-5" />}
                  {stat.label === 'Total Applications' && <Users className="w-5 h-5" />}
                  {stat.label === 'Candidates Hired' && <TrendingUp className="w-5 h-5" />}
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/recruiter/post-job">
            <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold">
              + Post New Job
            </Button>
          </Link>
          <Link href="/recruiter/applicants">
            <Button variant="outline" className="w-full h-20 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 text-lg font-semibold">
              View All Applicants
            </Button>
          </Link>
        </div>

        {/* Recent Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Recent Applications
              </CardTitle>
              <Link href="/recruiter/applicants">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recentApplications || []).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-orange-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{app.candidate}</h3>
                      <Badge variant="secondary" className="text-xs">{app.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Applied: {new Date(app.appliedDate).toLocaleDateString()} • CGPA: {app.cgpa}
                    </p>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status}
                  </Badge>
                </div>
              ))}

              {!data?.recentApplications?.length ? (
                <p className="text-sm text-muted-foreground">No applications received yet.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
