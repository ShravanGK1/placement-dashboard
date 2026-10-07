import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, verifyAuthTokenEdge } from '@/lib/edge-auth'

export async function middleware(request: NextRequest) {
  // Generate a unique Request ID for tracing
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  const path = request.nextUrl.pathname

  // 1. Role-Based Route Protection
  const isStudentRoute = path.startsWith('/student')
  const isRecruiterRoute = path.startsWith('/recruiter')
  const isAdminRoute = path.startsWith('/admin')
  const isAuthPage = path === '/login' || path === '/signup'

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const user = token ? await verifyAuthTokenEdge(token) : null

  // If user is accessing a protected route without valid auth -> redirect to /login
  if (isStudentRoute || isRecruiterRoute || isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      const response = NextResponse.redirect(loginUrl)
      // Clean up invalid cookie if present
      if (token) {
        response.cookies.delete(AUTH_COOKIE_NAME)
      }
      return response
    }

    // Role verification
    if (isStudentRoute && user.role !== 'student') {
      const targetUrl = new URL(`/${user.role}/dashboard`, request.url)
      return NextResponse.redirect(targetUrl)
    }

    if (isRecruiterRoute && user.role !== 'recruiter') {
      const targetUrl = new URL(`/${user.role}/dashboard`, request.url)
      return NextResponse.redirect(targetUrl)
    }

    if (isAdminRoute && user.role !== 'admin') {
      const targetUrl = new URL(`/${user.role}/dashboard`, request.url)
      return NextResponse.redirect(targetUrl)
    }
  }

  // If already authenticated and visiting /login or /signup -> redirect to role dashboard
  if (isAuthPage && user) {
    const targetUrl = new URL(`/${user.role}/dashboard`, request.url)
    return NextResponse.redirect(targetUrl)
  }

  const response = NextResponse.next()

  // Set Request ID in headers for downstream services to use
  response.headers.set('X-Request-Id', requestId)
  request.headers.set('X-Request-Id', requestId)

  // CORS Headers for API routes
  if (path.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id')
  }

  // Execution timing header
  const executionTime = Date.now() - startTime
  response.headers.set('X-Execution-Time', `${executionTime}ms`)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}
