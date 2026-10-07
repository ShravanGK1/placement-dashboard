'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout, NavItem } from '@/components/dashboard-layout'
import { LivePlacementTicker } from '@/components/ds/live-placement-ticker'
import { ClusterStatusBanner } from '@/components/ds/cluster-status-banner'
import DsDashboardWorkbench from '@/components/ds/ds-dashboard-workbench'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Briefcase, Cpu, Sparkles, Layers } from 'lucide-react'
import Link from 'next/link'

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
  const [activeSection, setActiveSection] = useState<'overview' | 'ds'>('overview')

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        onClick: () => setActiveSection('overview'),
        active: activeSection === 'overview',
        icon: '📊',
      },
      { label: 'Post Job', href: '/recruiter/post-job', icon: '➕' },
      { label: 'Applicants', href: '/recruiter/applicants', icon: '👥' },
      {
        label: 'DS Modules (FA-2)',
        onClick: () => setActiveSection('ds'),
        active: activeSection === 'ds',
        icon: '⚡',
        badge: 'FA-2',
      },
    ],
    [activeSection]
  )

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
    <DashboardLayout
      navItems={navItems}
      title={activeSection === 'ds' ? 'Distributed Systems Workbench' : 'Recruiter Dashboard'}
      userInitial="R"
      onOpenDsWorkbench={() => setActiveSection(activeSection === 'ds' ? 'overview' : 'ds')}
      isDsWorkbenchActive={activeSection === 'ds'}
    >
      <div className="space-y-6">
        <LivePlacementTicker />
        <ClusterStatusBanner
          activeTab={activeSection}
          onOpenWorkbench={() => setActiveSection(activeSection === 'ds' ? 'overview' : 'ds')}
        />

        {/* In-Dashboard Section Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'overview'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Recruiter Overview</span>
            </button>

            <button
              onClick={() => setActiveSection('ds')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'ds'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>DS Interactive Modules (FA-2)</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold">
                Live
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Unit III & IV Active Engine</span>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {/* Tab 1: Embedded DS Workbench */}
        {activeSection === 'ds' && (
          <div className="animate-in fade-in duration-200">
            <DsDashboardWorkbench />
          </div>
        )}

        {/* Tab 2: Recruiter Overview Content */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-sm bg-white">
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

            {/* Quick DS Modules Launcher inside Recruiter Overview */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 border border-indigo-900/60 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm tracking-wide text-indigo-200">
                    Distributed Mutex & Interview Calling
                  </h3>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Simulate concurrent applicant slot locking via Ricart-Agrawala, WebRTC P2P mock technical rooms, and JSON-RPC applicant screening endpoints.
                </p>
              </div>
              <Button
                onClick={() => setActiveSection('ds')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 shrink-0 shadow-sm"
              >
                <Layers className="w-4 h-4 mr-1.5" /> Launch DS Workbench
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/recruiter/post-job">
                <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold shadow-sm">
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
            <Card className="border-0 shadow-sm bg-white">
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
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-orange-50/50 transition-colors"
                    >
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
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
