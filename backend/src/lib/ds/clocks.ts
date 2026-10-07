export interface CausalEvent {
  id: string;
  processId: 'P1' | 'P2' | 'P3';
  processName: string;
  action: string;
  lamportTime: number;
  vectorTime: [number, number, number];
  timestamp: number;
}

class ClockEngine {
  private lamportClocks: [number, number, number] = [0, 0, 0];
  private vectorClocks: {
    P1: [number, number, number];
    P2: [number, number, number];
    P3: [number, number, number];
  } = {
    P1: [0, 0, 0],
    P2: [0, 0, 0],
    P3: [0, 0, 0],
  };
  private events: CausalEvent[] = [];

  recordEvent(
    proc: 'P1' | 'P2' | 'P3',
    action: string,
    messageFrom?: 'P1' | 'P2' | 'P3'
  ): CausalEvent {
    const pIdx = proc === 'P1' ? 0 : proc === 'P2' ? 1 : 2;

    // Lamport clock update rule
    let incomingLamport = 0;
    if (messageFrom) {
      const fromIdx = messageFrom === 'P1' ? 0 : messageFrom === 'P2' ? 1 : 2;
      incomingLamport = this.lamportClocks[fromIdx];
    }
    const nextLamport = Math.max(this.lamportClocks[pIdx], incomingLamport) + 1;
    this.lamportClocks[pIdx] = nextLamport;

    // Vector clock update rule
    const currentV = [...this.vectorClocks[proc]] as [number, number, number];
    if (messageFrom) {
      const fromV = this.vectorClocks[messageFrom];
      currentV[0] = Math.max(currentV[0], fromV[0]);
      currentV[1] = Math.max(currentV[1], fromV[1]);
      currentV[2] = Math.max(currentV[2], fromV[2]);
    }
    currentV[pIdx] += 1;
    this.vectorClocks[proc] = currentV;

    const procName =
      proc === 'P1' ? 'Student (P1)' : proc === 'P2' ? 'Recruiter (P2)' : 'Placement Officer (P3)';

    const event: CausalEvent = {
      id: crypto.randomUUID(),
      processId: proc,
      processName: procName,
      action,
      lamportTime: nextLamport,
      vectorTime: currentV,
      timestamp: Date.now(),
    };

    this.events.unshift(event);
    if (this.events.length > 50) this.events.pop();

    return event;
  }

  getClockState() {
    return {
      lamportClocks: this.lamportClocks,
      vectorClocks: this.vectorClocks,
      events: this.events.slice(0, 20),
    };
  }

  reset() {
    this.lamportClocks = [0, 0, 0];
    this.vectorClocks = { P1: [0, 0, 0], P2: [0, 0, 0], P3: [0, 0, 0] };
    this.events = [];
  }
}

export const clockEngine = new ClockEngine();
