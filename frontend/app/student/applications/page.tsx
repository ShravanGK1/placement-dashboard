'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FileText, Video } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/student/jobs', icon: '💼' },
  { label: 'My Applications', href: '/student/applications', icon: '📋' },
  { label: 'Profile', href: '/student/profile', icon: '👤' },
]

interface ApplicationItem {
  id: string
  company: string
  role: string
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected'
  appliedDate: string
  package: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'shortlisted':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'selected':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-300'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/student/applications', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Unable to load applications')
        }
        const data = await response.json()
        if (!ignore) {
          setApplications(data.applications || [])
        }
      } catch {
        if (!ignore) {
          setError('Unable to load applications right now.')
        }
      }
    }

    fetchApplications()

    return () => {
      ignore = true
    }
  }, [])

  const allApplications = applications
  const appliedApps = useMemo(() => applications.filter((a) => a.status === 'applied'), [applications])
  const shortlistedApps = useMemo(
    () => applications.filter((a) => a.status === 'shortlisted'),
    [applications]
  )
  const selectedApps = useMemo(() => applications.filter((a) => a.status === 'selected'), [applications])
  const rejectedApps = useMemo(() => applications.filter((a) => a.status === 'rejected'), [applications])

  const ApplicationsTable = ({ data }: { data: ApplicationItem[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Interview Room</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((app) => (
            <TableRow key={app.id} className="hover:bg-orange-50">
              <TableCell className="font-medium">{app.company}</TableCell>
              <TableCell>{app.role}</TableCell>
              <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
              <TableCell className="font-semibold text-green-600">{app.package}</TableCell>
              <TableCell>
                <Badge className={`capitalize border ${getStatusColor(app.status)}`}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                {app.status === 'shortlisted' || app.status === 'selected' ? (
                  <Link href={`/interview/interview-${app.id}`}>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs gap-1">
                      <Video className="w-3.5 h-3.5" />
                      Join P2P Room
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground italic">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <DashboardLayout navItems={navItems} title="My Applications" userInitial="S">
      <div className="space-y-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5 gap-1">
            <TabsTrigger value="all">All ({allApplications.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({appliedApps.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApps.length})</TabsTrigger>
            <TabsTrigger value="selected">Selected ({selectedApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="border-0 shadow-sm mt-4">
              <CardContent className="pt-6">
                <ApplicationsTable data={allApplications} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applied">
            <Card className="border-0 shadow-sm mt-4">
              <CardContent className="pt-6">
                {appliedApps.length > 0 ? (
                  <ApplicationsTable data={appliedApps} />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlisted">
            <Card className="border-0 shadow-sm mt-4">
              <CardContent className="pt-6">
                {shortlistedApps.length > 0 ? (
                  <ApplicationsTable data={shortlistedApps} />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No shortlisted applications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selected">
            <Card className="border-0 shadow-sm mt-4">
              <CardContent className="pt-6">
                {selectedApps.length > 0 ? (
                  <ApplicationsTable data={selectedApps} />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No selected applications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card className="border-0 shadow-sm mt-4">
              <CardContent className="pt-6">
                {rejectedApps.length > 0 ? (
                  <ApplicationsTable data={rejectedApps} />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No rejected applications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
