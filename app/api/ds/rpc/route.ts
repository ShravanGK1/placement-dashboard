import { NextRequest, NextResponse } from 'next/server';
import { rpcRegistry } from '@/lib/ds/rpc';
import { withLogging, withFaultTolerance } from '@/lib/middleware/api-middleware';

async function rpcHandler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();

    // Handle Batch
    if (Array.isArray(body)) {
      const results = await rpcRegistry.handleBatch(body);
      return NextResponse.json(results);
    }
    
    // Handle Single
    const result = await rpcRegistry.handle(body);
    
    // If it was a notification, result is null, return 204 No Content
    if (result === null) {
      return new NextResponse(null, { status: 204 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    );
  }
}

// Apply middlewares
export const POST = withLogging(withFaultTolerance(rpcHandler));
export const OPTIONS = () => new NextResponse(null, { status: 200 }); // Handled by edge middleware CORS
