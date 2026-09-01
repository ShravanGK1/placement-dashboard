'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    let ignore = false

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          localStorage.removeItem('userRole')
          if (!ignore) {
            router.replace('/login')
          }
          return
        }

        const data = await response.json()
        localStorage.setItem('userRole', data.user.role)
        if (!ignore) {
          router.replace(`/${data.user.role}/dashboard`)
        }
      } catch {
        localStorage.removeItem('userRole')
        if (!ignore) {
          router.replace('/login')
        }
      }
    }

    checkSession()

    return () => {
      ignore = true
    }
  }, [router])

  return null
}
