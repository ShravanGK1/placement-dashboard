'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout, NavItem } from '@/components/dashboard-layout'
import { LivePlacementTicker } from '@/components/ds/live-placement-ticker'
import { ClusterStatusBanner } from '@/components/ds/cluster-status-banner'
import DsDashboardWorkbench from '@/components/ds/ds-dashboard-workbench'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Briefcase, TrendingUp, Sparkles, Cpu, Layers } from 'lucide-react'
import Link from 'next/link'

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
  const [activeSection, setActiveSection] = useState<'overview' | 'ds'>('overview')

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        onClick: () => setActiveSection('overview'),
        active: activeSection === 'overview',
        icon: '📊',
      },
      { label: 'Jobs', href: '/student/jobs', icon: '💼' },
      { label: 'My Applications', href: '/student/applications', icon: '📋' },
      { label: 'Inbox & Invites', href: '/student/inbox', icon: '📥' },
      {
        label: 'DS Modules (FA-2)',
        onClick: () => setActiveSection('ds'),
        active: activeSection === 'ds',
        icon: '⚡',
        badge: 'FA-2',
      },
      { label: 'Profile', href: '/student/profile', icon: '👤' },
    ],
    [activeSection]
  )

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
    <DashboardLayout
      navItems={navItems}
      title={activeSection === 'ds' ? 'Distributed Systems Workbench' : 'Student Dashboard'}
      userInitial="S"
      onOpenDsWorkbench={() => setActiveSection(activeSection === 'ds' ? 'overview' : 'ds')}
      isDsWorkbenchActive={activeSection === 'ds'}
    >
      <div className="space-y-6">
        {/* Real-time ticker & Distributed Health Banner */}
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
              <span>Placement Overview</span>
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

        {/* Tab 2: Dashboard Overview Content */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-sm bg-white">
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

            {/* Quick DS Modules Launcher inside Placement Overview */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 border border-indigo-900/60 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm tracking-wide text-indigo-200">
                    Distributed Systems Simulations Embedded
                  </h3>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Inspect Leader Election (Bully/Ring), Lamport & Vector Clocks, Ricart-Agrawala Mutex, Chandy-Misra-Haas Deadlock Probing, and WebRTC Video right inside your dashboard.
                </p>
              </div>
              <Button
                onClick={() => setActiveSection('ds')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 shrink-0 shadow-sm"
              >
                <Layers className="w-4 h-4 mr-1.5" /> Launch DS Workbench
              </Button>
            </div>

            {/* Recent Job Postings */}
            <Card className="border-0 shadow-sm bg-white">
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
                    <div
                      key={job.id}
                      className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-orange-50/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{job.company}</h3>
                          <Badge variant="secondary" className="text-xs">{job.branch}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{job.role}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Package: <span className="font-semibold text-green-600">{job.package}</span>
                          </span>
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
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
