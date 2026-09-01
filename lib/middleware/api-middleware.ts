import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type ApiHandler = (req: NextRequest, ctx: any) => Promise<NextResponse> | NextResponse;

export function withLogging(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ctx: any) => {
    const requestId = req.headers.get('X-Request-Id') || 'unknown';
    const startTime = Date.now();
    
    console.log(`[API START] [${requestId}] ${req.method} ${req.url}`);
    
    try {
      const response = await handler(req, ctx);
      const executionTime = Date.now() - startTime;
      console.log(`[API END] [${requestId}] ${req.method} ${req.url} - ${response.status} (${executionTime}ms)`);
      return response;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`[API ERROR] [${requestId}] ${req.method} ${req.url} - (${executionTime}ms)`, error);
      throw error;
    }
  };
}

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ctx: any) => {
    // Demo implementation - in a real app, verify the authorization header
    const authHeader = req.headers.get('Authorization');
    
    // For demo purposes, we'll let it pass if it's localhost or mock auth
    if (!authHeader && !req.url.includes('localhost')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    return handler(req, ctx);
  };
}

export function withFaultTolerance(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      // Catch all unhandled errors and format them
      console.error('Unhandled API Error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal Server Error',
          metadata: { timestamp: new Date().toISOString() }
        }, 
        { status: 500 }
      );
    }
  };
}

// Simple sliding window rate limit simulation
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 100;

export function withRateLimit(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ctx: any) => {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    
    let timestamps = requestLog.get(ip) || [];
    timestamps = timestamps.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
    
    if (timestamps.length >= MAX_REQUESTS) {
      return NextResponse.json(
        { success: false, error: 'Too Many Requests' },
        { 
          status: 429,
          headers: { 'Retry-After': '60' }
        }
      );
    }
    
    timestamps.push(now);
    requestLog.set(ip, timestamps);
    
    return handler(req, ctx);
  };
}
