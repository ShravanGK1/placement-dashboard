import { NextRequest, NextResponse } from 'next/server';
import { clockEngine } from '@/lib/ds/clocks';
import { withLogging, withFaultTolerance } from '@/lib/middleware/api-middleware';

async function clocksHandler(req: NextRequest) {
  if (req.method === 'GET') {
    return NextResponse.json(clockEngine.getClockState());
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { action, processId, actionName, messageFrom } = body;

    if (action === 'reset') {
      clockEngine.reset();
      return NextResponse.json(clockEngine.getClockState());
    }

    if (processId && actionName) {
      const recorded = clockEngine.recordEvent(processId, actionName, messageFrom);
      return NextResponse.json({
        event: recorded,
        state: clockEngine.getClockState(),
      });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withLogging(withFaultTolerance(clocksHandler));
export const POST = withLogging(withFaultTolerance(clocksHandler));
export const OPTIONS = () => new NextResponse(null, { status: 200 });
