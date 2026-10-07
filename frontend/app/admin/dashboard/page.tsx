'use client'

import { useMemo, useState } from 'react'
import { DashboardLayout, NavItem } from '@/components/dashboard-layout'
import { LivePlacementTicker } from '@/components/ds/live-placement-ticker'
import { ClusterStatusBanner } from '@/components/ds/cluster-status-banner'
import DsDashboardWorkbench from '@/components/ds/ds-dashboard-workbench'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, TrendingUp, Award, Cpu, Sparkles, Layers } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const stats = [
  { label: 'Total Students', value: '2,450', color: 'bg-blue-50 text-blue-600' },
  { label: 'Total Offers', value: '456', color: 'bg-green-50 text-green-600' },
  { label: 'Active Companies', value: '82', color: 'bg-purple-50 text-purple-600' },
  { label: 'Placement Rate', value: '78%', color: 'bg-orange-50 text-orange-600' },
]

const placementData = [
  { branch: 'CSE', placements: 85, total: 95 },
  { branch: 'IT', placements: 72, total: 88 },
  { branch: 'ECE', placements: 65, total: 82 },
  { branch: 'Mechanical', placements: 58, total: 75 },
  { branch: 'Civil', placements: 42, total: 60 },
  { branch: 'Electrical', placements: 48, total: 70 },
]

const topCompanies = [
  { name: 'Tech Corp', offers: 45, package: '12 LPA' },
  { name: 'Finance Solutions', offers: 38, package: '8 LPA' },
  { name: 'Cloud Systems', offers: 32, package: '10 LPA' },
  { name: 'AI Innovations', offers: 28, package: '14 LPA' },
  { name: 'Mobile Apps Inc', offers: 25, package: '9 LPA' },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'overview' | 'ds'>('overview')

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        onClick: () => setActiveSection('overview'),
        active: activeSection === 'overview',
        icon: '📊',
      },
      { label: 'Users', href: '/admin/users', icon: '👥' },
      { label: 'Companies', href: '/admin/companies', icon: '🏢' },
      { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
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

  return (
    <DashboardLayout
      navItems={navItems}
      title={activeSection === 'ds' ? 'Distributed Systems Workbench' : 'Admin Dashboard'}
      userInitial="A"
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
              <Award className="w-4 h-4" />
              <span>Admin Overview</span>
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

        {/* Tab 1: Embedded DS Workbench */}
        {activeSection === 'ds' && (
          <div className="animate-in fade-in duration-200">
            <DsDashboardWorkbench />
          </div>
        )}

        {/* Tab 2: Admin Overview Content */}
        {activeSection === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-sm bg-white">
                  <CardContent className="pt-6">
                    <div className={`p-3 rounded-lg ${stat.color} w-fit mb-3`}>
                      {stat.label === 'Total Students' && <Users className="w-5 h-5" />}
                      {stat.label === 'Total Offers' && <Award className="w-5 h-5" />}
                      {stat.label === 'Active Companies' && <Briefcase className="w-5 h-5" />}
                      {stat.label === 'Placement Rate' && <TrendingUp className="w-5 h-5" />}
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick DS Modules Launcher inside Admin Overview */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 border border-indigo-900/60 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm tracking-wide text-indigo-200">
                    Coordinator Node & Consensus Controls
                  </h3>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Inspect cluster heartbeat beacons, trigger Bully coordinator re-elections, monitor Chandy-Lamport global system snapshots, and inspect distributed trace IDs.
                </p>
              </div>
              <Button
                onClick={() => setActiveSection('ds')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 shrink-0 shadow-sm"
              >
                <Layers className="w-4 h-4 mr-1.5" /> Launch DS Workbench
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Placements by Branch Chart */}
              <Card className="border-0 shadow-sm lg:col-span-2 bg-white">
                <CardHeader>
                  <CardTitle>Placements by Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={placementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="placements" fill="#f97316" />
                      <Bar dataKey="total" fill="#fbbf24" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Top Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCompanies.map((company) => (
                      <div key={company.name} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-foreground">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.offers} offers</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                          {company.package}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-16 border-orange-300 hover:bg-orange-50">
                  <div className="text-left">
                    <p className="font-semibold text-orange-600">Manage Users</p>
                    <p className="text-xs text-muted-foreground">View & control user accounts</p>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/companies">
                <Button variant="outline" className="w-full h-16 border-orange-300 hover:bg-orange-50">
                  <div className="text-left">
                    <p className="font-semibold text-orange-600">Manage Companies</p>
                    <p className="text-xs text-muted-foreground">Add & verify companies</p>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-16 border-orange-300 hover:bg-orange-50">
                  <div className="text-left">
                    <p className="font-semibold text-orange-600">View Analytics</p>
                    <p className="text-xs text-muted-foreground">Detailed statistics & reports</p>
                  </div>
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
