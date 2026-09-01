import { NextResponse } from 'next/server';
import { globalCircuitBreaker } from '@/lib/ds/fault-tolerance';

export async function GET() {
  const uptime = process.uptime();
  
  // Simulate DB check latency
  const dbLatencyStart = Date.now();
  await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
  const dbLatency = Date.now() - dbLatencyStart;

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    services: {
      api: 'up',
      database: dbLatency < 100 ? 'up' : 'degraded',
      dbLatencyMs: dbLatency
    },
    circuitBreakers: {
      global: globalCircuitBreaker.getState()
    },
    memory: process.memoryUsage()
  };

  return NextResponse.json(healthData);
}
