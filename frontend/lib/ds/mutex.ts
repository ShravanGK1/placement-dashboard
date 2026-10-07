export interface MutexPod {
  id: number;
  name: string;
  state: 'RELEASED' | 'WANTED' | 'HELD';
  timestamp: number;
  repliesReceived: number;
}

class MutexManager {
  private pods: Map<number, MutexPod> = new Map();
  private logicalClock: number = 1;
  private currentHolder: number | null = null;
  private logs: string[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.pods.clear();
    this.pods.set(1, { id: 1, name: 'Interview Pod A (Google)', state: 'RELEASED', timestamp: 0, repliesReceived: 0 });
    this.pods.set(2, { id: 2, name: 'Interview Pod B (Microsoft)', state: 'RELEASED', timestamp: 0, repliesReceived: 0 });
    this.pods.set(3, { id: 3, name: 'Interview Pod C (Amazon)', state: 'RELEASED', timestamp: 0, repliesReceived: 0 });
    this.currentHolder = null;
    this.logs = [];
  }

  getState() {
    return {
      pods: Array.from(this.pods.values()),
      currentHolder: this.currentHolder,
      logicalClock: this.logicalClock,
      logs: this.logs.slice(-20),
    };
  }

  requestLock(podId: number) {
    this.logicalClock += 1;
    const reqPod = this.pods.get(podId);
    if (!reqPod) return;

    reqPod.state = 'WANTED';
    reqPod.timestamp = this.logicalClock;
    reqPod.repliesReceived = 0;

    this.logs.unshift(`Pod ${podId} (${reqPod.name}) requested Critical Section (CS) lock with T=${this.logicalClock}`);

    // If nobody holds CS, grant immediately
    if (this.currentHolder === null) {
      reqPod.state = 'HELD';
      reqPod.repliesReceived = 2;
      this.currentHolder = podId;
      this.logs.unshift(`Pod ${podId} received all 2 replies -> ENTERED CRITICAL SECTION.`);
    }
  }

  releaseLock(podId: number) {
    const pod = this.pods.get(podId);
    if (pod && pod.state === 'HELD') {
      pod.state = 'RELEASED';
      pod.timestamp = 0;
      pod.repliesReceived = 0;
      this.currentHolder = null;
      this.logs.unshift(`Pod ${podId} finished interview round & RELEASED Critical Section lock.`);

      // Check if any other pod is waiting
      const waiting = Array.from(this.pods.values()).filter((p) => p.state === 'WANTED');
      if (waiting.length > 0) {
        // Lowest timestamp wins
        waiting.sort((a, b) => a.timestamp - b.timestamp || a.id - b.id);
        const nextWinner = waiting[0];
        nextWinner.state = 'HELD';
        nextWinner.repliesReceived = 2;
        this.currentHolder = nextWinner.id;
        this.logs.unshift(`Deferred reply sent to Pod ${nextWinner.id} -> Pod ${nextWinner.id} ENTERED CRITICAL SECTION.`);
      }
    }
  }
}

export const mutexManager = new MutexManager();
