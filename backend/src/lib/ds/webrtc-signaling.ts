type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';

export interface SignalMessage {
  id: string;
  type: SignalType;
  senderId: string;
  targetId?: string;
  data?: any;
  timestamp: number;
}

class WebRTCSignalingStore {
  // room_id -> messages
  private rooms = new Map<string, SignalMessage[]>();
  // room_id -> Map<peerId, lastSeenTimestamp>
  private roomPeers = new Map<string, Map<string, number>>();

  constructor() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 30000);
    }
  }

  registerPeer(roomId: string, peerId: string) {
    if (!this.roomPeers.has(roomId)) {
      this.roomPeers.set(roomId, new Map());
    }
    const peers = this.roomPeers.get(roomId)!;
    peers.set(peerId, Date.now());
  }

  removePeer(roomId: string, peerId: string) {
    if (this.roomPeers.has(roomId)) {
      this.roomPeers.get(roomId)!.delete(peerId);
    }
    
    // Push a leave signal for all remaining peers in the room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    
    const leaveSignal: SignalMessage = {
      id: crypto.randomUUID(),
      type: 'leave',
      senderId: peerId,
      timestamp: Date.now(),
    };

    this.rooms.get(roomId)!.push(leaveSignal);
  }

  getPeersInRoom(roomId: string, currentPeerId: string): string[] {
    const peersMap = this.roomPeers.get(roomId);
    if (!peersMap) return [];
    
    const now = Date.now();
    const activePeers: string[] = [];
    for (const [pId, lastSeen] of peersMap.entries()) {
      if (now - lastSeen < 15000 && pId !== currentPeerId) {
        activePeers.push(pId);
      }
    }
    return activePeers;
  }

  addSignal(roomId: string, message: Omit<SignalMessage, 'id' | 'timestamp'>) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    
    // Only touch peer heartbeat if message is NOT 'leave'
    if (message.type !== 'leave') {
      this.registerPeer(roomId, message.senderId);
    } else {
      if (this.roomPeers.has(roomId)) {
        this.roomPeers.get(roomId)!.delete(message.senderId);
      }
    }

    const signal: SignalMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    this.rooms.get(roomId)!.push(signal);
    return signal;
  }

  getSignalsForPeer(roomId: string, peerId: string, since: number = 0) {
    // Only register heartbeat if peer is still active in roomPeers
    const peersMap = this.roomPeers.get(roomId);
    if (peersMap && peersMap.has(peerId)) {
      this.registerPeer(roomId, peerId);
    }

    const roomSignals = this.rooms.get(roomId) || [];
    // Return signals intended for this peer or broadcast signals (no targetId) after 'since'
    return roomSignals.filter(
      s => s.senderId !== peerId && (s.targetId === peerId || !s.targetId) && s.timestamp > since
    );
  }
  
  clearRoom(roomId: string) {
    this.rooms.delete(roomId);
    this.roomPeers.delete(roomId);
  }

  private cleanup() {
    const now = Date.now();
    const expiryTime = 3 * 60 * 1000; // 3 minutes
    
    for (const [roomId, signals] of this.rooms.entries()) {
      const validSignals = signals.filter(s => now - s.timestamp < expiryTime);
      if (validSignals.length === 0) {
        this.rooms.delete(roomId);
      } else {
        this.rooms.set(roomId, validSignals);
      }
    }

    for (const [roomId, peersMap] of this.roomPeers.entries()) {
      for (const [pId, lastSeen] of peersMap.entries()) {
        if (now - lastSeen > 15000) {
          peersMap.delete(pId);
        }
      }
      if (peersMap.size === 0) {
        this.roomPeers.delete(roomId);
      }
    }
  }
}

export const signalingStore = new WebRTCSignalingStore();
