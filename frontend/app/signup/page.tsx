'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to create account')
        return
      }

      localStorage.setItem('userRole', data.user.role)
      router.push(`/${data.user.role}/dashboard`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 mb-4">
              <span className="text-xl font-bold text-orange-600">CP</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Campus Placement Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-white">
                <User className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-0 focus-visible:ring-0 flex-1"
                />
              </div>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-white">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-0 focus-visible:ring-0 flex-1"
                />
              </div>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-white">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-0 focus-visible:ring-0 flex-1"
                />
              </div>
            </FieldGroup>

            <FieldSet>
              <FieldLegend>I am a...</FieldLegend>
              <RadioGroup value={role} onValueChange={setRole} className="space-y-3 mt-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="student" id="student" />
                  <label htmlFor="student" className="text-sm cursor-pointer">Student</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="recruiter" id="recruiter" />
                  <label htmlFor="recruiter" className="text-sm cursor-pointer">Recruiter</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <label htmlFor="admin" className="text-sm cursor-pointer">Admin</label>
                </div>
              </RadioGroup>
            </FieldSet>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
