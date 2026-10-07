import { NextRequest, NextResponse } from 'next/server';
import { cluster } from '@/lib/ds/election';
import { withLogging, withFaultTolerance } from '@/lib/middleware/api-middleware';

async function electionHandler(req: NextRequest) {
  if (req.method === 'GET') {
    return NextResponse.json(cluster.getClusterState());
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { action, nodeId } = body;

    if (action === 'trigger') {
      const result = cluster.runBullyElection(Number(nodeId) || 1);
      return NextResponse.json(result);
    }

    if (action === 'crash') {
      cluster.setNodeStatus(Number(nodeId), 'crashed');
      return NextResponse.json(cluster.getClusterState());
    }

    if (action === 'revive') {
      cluster.setNodeStatus(Number(nodeId), 'active');
      return NextResponse.json(cluster.getClusterState());
    }

    if (action === 'reset') {
      cluster.reset();
      return NextResponse.json(cluster.getClusterState());
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withLogging(withFaultTolerance(electionHandler));
export const POST = withLogging(withFaultTolerance(electionHandler));
export const OPTIONS = () => new NextResponse(null, { status: 200 });
