import { NextRequest, NextResponse } from 'next/server';
import { mutexManager } from '@/lib/ds/mutex';
import { withLogging, withFaultTolerance } from '@/lib/middleware/api-middleware';

async function mutexHandler(req: NextRequest) {
  if (req.method === 'GET') {
    return NextResponse.json(mutexManager.getState());
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { action, podId } = body;

    if (action === 'request' && podId) {
      mutexManager.requestLock(Number(podId));
      return NextResponse.json(mutexManager.getState());
    }

    if (action === 'release' && podId) {
      mutexManager.releaseLock(Number(podId));
      return NextResponse.json(mutexManager.getState());
    }

    if (action === 'reset') {
      mutexManager.reset();
      return NextResponse.json(mutexManager.getState());
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withLogging(withFaultTolerance(mutexHandler));
export const POST = withLogging(withFaultTolerance(mutexHandler));
export const OPTIONS = () => new NextResponse(null, { status: 200 });
