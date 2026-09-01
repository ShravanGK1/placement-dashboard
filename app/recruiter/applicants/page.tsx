'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, CheckCircle, XCircle, Video, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScheduleInterviewDialog } from '@/components/recruiter/schedule-interview-dialog'

const navItems = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: '📊' },
  { label: 'Post Job', href: '/recruiter/post-job', icon: '➕' },
  { label: 'Applicants', href: '/recruiter/applicants', icon: '👥' },
]

interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  role: string
  cgpa: string
  branch: string
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected'
  appliedDate: string
  resume: string | null
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

export default function ApplicantsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [scheduleApplicant, setScheduleApplicant] = useState<{ id: string; name: string; role: string } | null>(null)


  useEffect(() => {
    let ignore = false

    const fetchApplicants = async () => {
      try {
        const params = new URLSearchParams()
        if (search.trim()) {
          params.set('q', search.trim())
        }
        if (statusFilter !== 'all') {
          params.set('status', statusFilter)
        }

        const response = await fetch(`/api/recruiter/applicants?${params.toString()}`, {
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error('Unable to load applicants')
        }
        const data = await response.json()
        if (!ignore) {
          setApplicants(data.applicants || [])
        }
      } catch {
        if (!ignore) {
          setError('Unable to load applicants right now.')
        }
      }
    }

    fetchApplicants()

    return () => {
      ignore = true
    }
  }, [search, statusFilter])

  const filteredApplicants = useMemo(() => applicants, [applicants])

  const updateStatus = async (
    id: string,
    newStatus: 'applied' | 'shortlisted' | 'selected' | 'rejected'
  ) => {
    setUpdatingId(id)
    setError('')

    try {
      const response = await fetch(`/api/recruiter/applicants/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to update status')
      }

      setApplicants((prev) => prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)))
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <DashboardLayout navItems={navItems} title="Applicants" userInitial="R">
      <div className="space-y-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applicants Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>
              {filteredApplicants.length} {filteredApplicants.length === 1 ? 'Applicant' : 'Applicants'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role Applied</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((app) => (
                    <TableRow key={app.id} className="hover:bg-orange-50">
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell className="text-sm">{app.email}</TableCell>
                      <TableCell>{app.role}</TableCell>
                      <TableCell className="font-semibold">{app.cgpa}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{app.branch}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs gap-1"
                            onClick={() => setScheduleApplicant({ id: app.id, name: app.name, role: app.role })}
                            title="Schedule WebRTC Interview"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Schedule Meet
                          </Button>
                          <Link href={`/interview/interview-${app.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-200 hover:bg-orange-50 font-medium text-xs gap-1"
                              title="Start Instant P2P WebRTC Room"
                            >
                              <Video className="w-3.5 h-3.5 text-orange-600" />
                              Instant Room
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateStatus(app.id, 'selected')}
                            title="Mark as Selected"
                            disabled={updatingId === app.id}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(app.id, 'rejected')}
                            title="Reject"
                            disabled={updatingId === app.id}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredApplicants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applicants found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {scheduleApplicant && (
          <ScheduleInterviewDialog
            open={!!scheduleApplicant}
            onOpenChange={(open) => !open && setScheduleApplicant(null)}
            applicationId={scheduleApplicant.id}
            candidateName={scheduleApplicant.name}
            candidateRole={scheduleApplicant.role}
            onScheduled={() => {
              setApplicants((prev) =>
                prev.map((app) => (app.id === scheduleApplicant.id ? { ...app, status: 'shortlisted' } : app))
              )
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

