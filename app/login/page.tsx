'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to login')
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
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Campus Placement Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
