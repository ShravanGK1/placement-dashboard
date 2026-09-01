import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a unique Request ID for tracing
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  const response = NextResponse.next();

  // Set Request ID in headers for downstream services to use
  response.headers.set('X-Request-Id', requestId);
  request.headers.set('X-Request-Id', requestId);

  // Authentication & Route Protection
  const path = request.nextUrl.pathname;

  // Basic check for protected routes, actual auth would check JWT/session
  const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/student') || path.startsWith('/recruiter');
  
  if (isProtectedRoute) {
    // Demo: In a real app, verify token here.
    const token = request.cookies.get('auth-token');
    // if (!token) return NextResponse.redirect(new URL('/login', request.url));
  }

  // CORS Headers for API routes
  if (path.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
  }

  // Execution timing header
  const executionTime = Date.now() - startTime;
  response.headers.set('X-Execution-Time', `${executionTime}ms`);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
