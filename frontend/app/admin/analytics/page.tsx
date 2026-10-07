'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Companies', href: '/admin/companies', icon: '🏢' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
]

const placementByBranch = [
  { branch: 'CSE', placements: 85, total: 95, rate: 89 },
  { branch: 'IT', placements: 72, total: 88, rate: 82 },
  { branch: 'ECE', placements: 65, total: 82, rate: 79 },
  { branch: 'Mechanical', placements: 58, total: 75, rate: 77 },
  { branch: 'Civil', placements: 42, total: 60, rate: 70 },
  { branch: 'Electrical', placements: 48, total: 70, rate: 69 },
]

const monthlyTrend = [
  { month: 'Jan', offers: 45, applications: 280, placements: 38 },
  { month: 'Feb', offers: 52, applications: 310, placements: 45 },
  { month: 'Mar', offers: 68, applications: 380, placements: 58 },
  { month: 'Apr', offers: 75, applications: 420, placements: 65 },
  { month: 'May', offers: 82, applications: 450, placements: 72 },
  { month: 'Jun', offers: 95, applications: 520, placements: 85 },
]

const packageDistribution = [
  { range: '5-7 LPA', students: 45, fill: '#fbbf24' },
  { range: '7-10 LPA', students: 120, fill: '#f97316' },
  { range: '10-15 LPA', students: 180, fill: '#ea580c' },
  { range: '15+ LPA', students: 85, fill: '#c2410c' },
]

const roleDistribution = [
  { name: 'Students', value: 2450, fill: '#60a5fa' },
  { name: 'Recruiters', value: 82, fill: '#a78bfa' },
  { name: 'Admins', value: 5, fill: '#f97316' },
]

export default function AnalyticsPage() {
  return (
    <DashboardLayout navItems={navItems} title="Analytics & Reports" userInitial="A">
      <div className="space-y-6">
        {/* Placement by Branch */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Placement Rate by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={placementByBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="placements" fill="#f97316" name="Placements" />
                <Bar yAxisId="left" dataKey="total" fill="#fbbf24" name="Total Students" />
                <Bar yAxisId="right" dataKey="rate" fill="#10b981" name="Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="offers" stroke="#f97316" name="Offers" />
                  <Line type="monotone" dataKey="placements" stroke="#10b981" name="Placements" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Package Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Package Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={packageDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="range" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Application Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#8b5cf6" name="Applications" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Package', value: '₹11.2 LPA' },
                { label: 'Highest Package', value: '₹24 LPA' },
                { label: 'Lowest Package', value: '₹5.5 LPA' },
                { label: 'Median Package', value: '₹10.5 LPA' },
                { label: 'Overall Placement', value: '78%' },
                { label: 'Total Placements', value: '430' },
                { label: 'Avg CTC Increase', value: '+3.2%' },
                { label: 'Companies Hired', value: '82' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-orange-600">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
