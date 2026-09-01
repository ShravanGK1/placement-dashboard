'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Companies', href: '/admin/companies', icon: '🏢' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
]

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
  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard" userInitial="A">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Placements by Branch Chart */}
          <Card className="border-0 shadow-sm lg:col-span-2">
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
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCompanies.map((company, idx) => (
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
      </div>
    </DashboardLayout>
  )
}
