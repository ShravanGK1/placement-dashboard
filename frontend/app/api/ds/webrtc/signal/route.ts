import { NextRequest, NextResponse } from 'next/server';
import { signalingStore } from '@/lib/ds/webrtc-signaling';

// POST - Send a signal or heartbeat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, type, senderId, targetId, data } = body;

    if (!roomId || !type || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'leave') {
      signalingStore.removePeer(roomId, senderId);
      return NextResponse.json({ success: true });
    }

    const signal = signalingStore.addSignal(roomId, { type, senderId, targetId, data });
    const peers = signalingStore.getPeersInRoom(roomId, senderId);
    
    return NextResponse.json({ success: true, signal, peers });
  } catch {
    return NextResponse.json({ error: 'Failed to process signal' }, { status: 500 });
  }
}

// GET - Retrieve signals for a peer in a room + peer list
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const peerId = searchParams.get('peerId');
  const since = parseInt(searchParams.get('since') || '0', 10);

  if (!roomId || !peerId) {
    return NextResponse.json({ error: 'Missing roomId or peerId' }, { status: 400 });
  }

  const signals = signalingStore.getSignalsForPeer(roomId, peerId, since);
  const peers = signalingStore.getPeersInRoom(roomId, peerId);
  
  return NextResponse.json({ signals, peers });
}

// DELETE - Clear room or remove peer
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const peerId = searchParams.get('peerId');

  if (roomId && peerId) {
    signalingStore.removePeer(roomId, peerId);
  } else if (roomId) {
    signalingStore.clearRoom(roomId);
  }
  
  return NextResponse.json({ success: true });
}
