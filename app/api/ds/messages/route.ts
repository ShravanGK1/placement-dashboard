import { NextRequest, NextResponse } from 'next/server';
import { broker } from '@/lib/ds/message-broker';
import { withLogging, withFaultTolerance } from '@/lib/middleware/api-middleware';

// POST /api/ds/messages - Publish a message
export const POST = withLogging(withFaultTolerance(async (req: NextRequest) => {
  try {
    const { topic, payload } = await req.json();
    
    if (!topic || !payload) {
      return NextResponse.json({ error: 'Missing topic or payload' }, { status: 400 });
    }

    const messageId = await broker.publish(topic, payload);
    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to publish message' }, { status: 500 });
  }
}));

// GET /api/ds/messages?topic=x&action=status
export const GET = withLogging(withFaultTolerance(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const topic = searchParams.get('topic');

  if (action === 'status') {
    return NextResponse.json(broker.getQueueStatus());
  }
  
  if (action === 'dlq') {
    return NextResponse.json(broker.getDLQ());
  }
  
  if (action === 'recent' && topic) {
    return NextResponse.json(broker.getRecentMessages(topic));
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}));
