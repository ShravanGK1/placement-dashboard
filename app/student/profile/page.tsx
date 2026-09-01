'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { useEffect, useMemo, useState } from 'react'
import { Upload, X } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/student/jobs', icon: '💼' },
  { label: 'My Applications', href: '/student/applications', icon: '📋' },
  { label: 'Profile', href: '/student/profile', icon: '👤' },
]

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [branch, setBranch] = useState('')
  const [resume, setResume] = useState<string | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student/profile', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Unable to load profile')
        }

        const data = await response.json()
        if (!ignore) {
          const profile = data.profile
          setName(profile.name || '')
          setEmail(profile.email || '')
          setPhone(profile.phone || '')
          setCgpa(profile.cgpa === null || profile.cgpa === undefined ? '' : String(profile.cgpa))
          setBranch(profile.branch || '')
          setSkills(profile.skills || [])
          setResume(profile.resume || null)
        }
      } catch {
        if (!ignore) {
          setError('Unable to load profile data.')
        }
      }
    }

    fetchProfile()

    return () => {
      ignore = true
    }
  }, [])

  const normalizedSkills = useMemo(
    () => Array.from(new Set(skills.map((item) => item.trim()).filter(Boolean))),
    [skills]
  )

  const handleAddSkill = () => {
    const normalized = newSkill.trim()
    if (normalized && !skills.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) {
      setSkills([...skills, normalized])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResume(file.name)
    }
  }

  const handleSave = async () => {
    setError('')
    setMessage('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          cgpa: cgpa === '' ? null : Number(cgpa),
          branch,
          skills: normalizedSkills,
          resume,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      setSkills(normalizedSkills)
      setMessage('Profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout navItems={navItems} title="Profile" userInitial="S">
      <div className="space-y-6 max-w-3xl">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-600">{message}</p> : null}

        {/* Personal Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-input"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-input"
                />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-input"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="branch">Branch</FieldLabel>
                <Input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="border-input"
                />
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <FieldLabel htmlFor="cgpa">Current CGPA</FieldLabel>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="border-input"
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resume ? (
              <div className="flex items-center justify-between p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                <div>
                  <p className="font-medium text-foreground">{resume}</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResume(null)}
                  className="text-destructive hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="block p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-foreground mb-1">Upload Resume</p>
                <p className="text-xs text-muted-foreground">Drag and drop or click to select</p>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., Python)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                className="border-input flex-1"
              />
              <Button
                onClick={handleAddSkill}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-orange-100 text-orange-700 border-orange-300 flex items-center gap-2 px-3"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Cancel
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
