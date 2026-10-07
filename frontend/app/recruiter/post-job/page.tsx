'use client'

import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'

const navItems = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: '📊' },
  { label: 'Post Job', href: '/recruiter/post-job', icon: '➕' },
  { label: 'Applicants', href: '/recruiter/applicants', icon: '👥' },
]

const branches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Electrical']

export default function PostJobPage() {
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [package_, setPackage] = useState('')
  const [minCgpa, setMinCgpa] = useState('')
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleBranchChange = (branch: string) => {
    setSelectedBranches(prev =>
      prev.includes(branch)
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    )
  }

  const canSubmit = useMemo(
    () => selectedBranches.length > 0 && !isSubmitting,
    [isSubmitting, selectedBranches.length]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedBranches.length) {
      setError('Select at least one eligible branch.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          role: title,
          description,
          package: `₹${package_} LPA`,
          cgpa: `${minCgpa}+`,
          branches: selectedBranches,
          deadline: new Date(deadline).toISOString(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to post job')
      }

      setSubmitted(true)
      setCompany('')
      setTitle('')
      setDescription('')
      setPackage('')
      setMinCgpa('')
      setSelectedBranches([])
      setDeadline('')
      setTimeout(() => {
        setSubmitted(false)
      }, 2000)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout navItems={navItems} title="Post New Job" userInitial="R">
      <div className="max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Create Job Posting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel htmlFor="company">Company Name *</FieldLabel>
                <Input
                  id="company"
                  placeholder="e.g., Tech Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="border-input"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="title">Job Title *</FieldLabel>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer, Data Analyst"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-input"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="description">Job Description *</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="border-input min-h-32 resize-none"
                />
              </FieldGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup>
                  <FieldLabel htmlFor="package">Package (LPA) *</FieldLabel>
                  <Input
                    id="package"
                    placeholder="e.g., 12"
                    type="number"
                    step="0.5"
                    min="0"
                    value={package_}
                    onChange={(e) => setPackage(e.target.value)}
                    required
                    className="border-input"
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="minCgpa">Minimum CGPA *</FieldLabel>
                  <Input
                    id="minCgpa"
                    placeholder="e.g., 3.5"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    required
                    className="border-input"
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel htmlFor="deadline">Application Deadline *</FieldLabel>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="border-input"
                />
              </FieldGroup>

              <FieldSet>
                <FieldLegend>Eligible Branches *</FieldLegend>
                <div className="space-y-3 mt-3">
                  {branches.map((branch) => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={branch}
                        checked={selectedBranches.includes(branch)}
                        onCheckedChange={() => handleBranchChange(branch)}
                      />
                      <label htmlFor={branch} className="text-sm cursor-pointer font-medium">
                        {branch}
                      </label>
                    </div>
                  ))}
                </div>
              </FieldSet>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button variant="outline" type="reset">
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : submitted ? 'Job Posted Successfully!' : 'Post Job'}
                </Button>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
          </CardContent>
        </Card>

        {submitted && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Your job posting has been published successfully!
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
