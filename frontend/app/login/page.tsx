'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Mail, Lock, AlertCircle, UserCheck, ShieldCheck, GraduationCap, Briefcase, ChevronDown, Check } from 'lucide-react'

interface RoleProfile {
  role: 'student' | 'recruiter' | 'admin'
  name: string
  email: string
  password: string
  title: string
  icon: typeof GraduationCap
  badgeColor: string
  description: string
  features: string[]
}

const PROFILES: RoleProfile[] = [
  {
    role: 'student',
    name: 'Rahul Sharma',
    email: 'student@example.com',
    password: 'Password@123',
    title: 'Student Applicant',
    icon: GraduationCap,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Explore verified campus recruitment drives, submit applications, and participate in P2P interviews.',
    features: ['Apply to active campus jobs', 'Live WebRTC P2P interview room', 'Causal timeline & application tracker'],
  },
  {
    role: 'recruiter',
    name: 'Priya Patel',
    email: 'recruiter@example.com',
    password: 'Password@123',
    title: 'Tech Recruiter',
    icon: Briefcase,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Post job openings, manage candidates, and schedule interview rounds with distributed slot locking.',
    features: ['Post & manage recruitment drives', 'Applicant screening & shortlisting', 'Exclusive slot reservation (Ricart-Agrawala)'],
  },
  {
    role: 'admin',
    name: 'Dr. Joshi',
    email: 'admin@example.com',
    password: 'Password@123',
    title: 'Placement Officer / Admin',
    icon: ShieldCheck,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Oversee university placement statistics, manage registered companies, and supervise coordinator election nodes.',
    features: ['Placement rate & batch analytics', 'Company & student user management', 'Coordinator node election console (Bully/Ring)'],
  },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect')

  const [selectedRole, setSelectedRole] = useState<RoleProfile>(PROFILES[0])
  const [email, setEmail] = useState(PROFILES[0].email)
  const [password, setPassword] = useState(PROFILES[0].password)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSelectProfile = (profile: RoleProfile) => {
    setSelectedRole(profile)
    setEmail(profile.email)
    setPassword(profile.password)
    setError('')
  }

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
        setError(data.message || 'Unable to sign in. Please verify your credentials.')
        return
      }

      localStorage.setItem('userRole', data.user.role)

      if (redirectTarget && redirectTarget.startsWith(`/${data.user.role}`)) {
        router.push(redirectTarget)
      } else {
        router.push(`/${data.user.role}/dashboard`)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const IconComponent = selectedRole.icon

  return (
    <Card className="w-full max-w-xl border-0 shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-orange-500 via-indigo-500 to-purple-500"></div>

      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shadow-inner">
              <span className="text-lg font-bold text-orange-600">CP</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Placement Portal Sign In</CardTitle>
              <CardDescription className="text-xs text-slate-500">Select your user role or enter credentials</CardDescription>
            </div>
          </div>
          <Link
            href="/ds-demo"
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 transition-colors font-semibold flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>DS Showcase</span>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {redirectTarget && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Please sign in to access that protected page.</span>
          </div>
        )}

        {/* 1. Quick Role & User Profile Dropdown Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Select Active User Profile:</span>
            <span className="text-[11px] font-normal text-slate-400">Click to switch</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PROFILES.map((p) => {
              const isSelected = selectedRole.role === p.role
              const P_Icon = p.icon
              return (
                <button
                  type="button"
                  key={p.role}
                  onClick={() => handleSelectProfile(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-orange-500/50'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-800 text-orange-400' : 'bg-white text-slate-700 border border-slate-200'}`}>
                      <P_Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{p.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{p.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Role Overview & Applied Changes Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${selectedRole.badgeColor}`}>
                {selectedRole.title}
              </span>
              <span className="text-slate-600 font-medium">({selectedRole.email})</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Ready
            </span>
          </div>

          <p className="text-slate-600 text-[11px] leading-relaxed">
            {selectedRole.description}
          </p>

          <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
            {selectedRole.features.map((feat, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-white shadow-xs focus-within:border-orange-500">
              <Mail className="w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-0 focus-visible:ring-0 flex-1 text-xs text-slate-800"
              />
            </div>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-white shadow-xs focus-within:border-orange-500">
              <Lock className="w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-0 focus-visible:ring-0 flex-1 text-xs text-slate-800"
              />
            </div>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all text-xs"
          >
            {isLoading ? 'Signing In...' : `Sign In as ${selectedRole.name} (${selectedRole.role.toUpperCase()})`}
          </Button>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Need a new custom account?{' '}
          <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-semibold underline">
            Register Student / Recruiter
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-orange-50/50 to-slate-200 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-500 text-xs">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
