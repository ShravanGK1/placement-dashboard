'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Briefcase } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/student/jobs', icon: '💼' },
  { label: 'My Applications', href: '/student/applications', icon: '📋' },
  { label: 'Profile', href: '/student/profile', icon: '👤' },
]

interface StudentJob {
  id: string
  company: string
  role: string
  description: string
  package: string
  cgpa: string
  branches: string[]
  deadline: string
  applied: boolean
}

const logoMap: Record<string, string> = {
  'Tech Corp': '🏢',
  'Finance Solutions': '💰',
  'Cloud Systems': '☁️',
}

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [jobsData, setJobsData] = useState<StudentJob[]>([])
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/student/jobs', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Unable to load jobs')
        }
        const data = await response.json()
        if (!ignore) {
          setJobsData(data.jobs || [])
        }
      } catch {
        if (!ignore) {
          setError('Unable to load jobs right now.')
        }
      }
    }

    fetchJobs()

    return () => {
      ignore = true
    }
  }, [])

  const filteredJobs = useMemo(
    () =>
      jobsData.filter(
        (job) =>
          job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.role.toLowerCase().includes(search.toLowerCase())
      ),
    [jobsData, search]
  )

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId)
    setError('')

    try {
      const response = await fetch(`/api/student/jobs/${jobId}/apply`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to apply')
      }

      setJobsData((prev) => prev.map((job) => (job.id === jobId ? { ...job, applied: true } : job)))
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : 'Failed to apply for job.')
    } finally {
      setApplyingJobId(null)
    }
  }

  return (
    <DashboardLayout navItems={navItems} title="Jobs" userInitial="S">
      <div className="space-y-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{logoMap[job.company] || '🏫'}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{job.company}</h3>
                      <p className="text-sm text-muted-foreground">{job.role}</p>
                    </div>
                  </div>
                  {job.applied && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">Applied</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Package:</span>
                    <span className="font-semibold text-green-600">{job.package}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Min CGPA:</span>
                    <span className="font-semibold">{job.cgpa}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-semibold">{new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.branches.map((branch) => (
                    <Badge key={branch} variant="outline" className="text-xs">{branch}</Badge>
                  ))}
                </div>

                <Button
                  onClick={() => handleApply(job.id)}
                  disabled={job.applied || applyingJobId === job.id}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {job.applied ? 'Already Applied' : applyingJobId === job.id ? 'Applying...' : 'Easy Apply'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No jobs found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
