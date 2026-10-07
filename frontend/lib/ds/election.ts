export type NodeState = 'active' | 'crashed' | 'electing' | 'leader';

export interface CoordinatorNode {
  id: number;
  name: string;
  weight: number;
  status: NodeState;
  lastBeacon: number;
}

export interface ElectionTrace {
  id: string;
  from: number;
  to: number;
  type: 'ELECTION' | 'OK' | 'COORDINATOR' | 'BEACON' | 'TOKEN';
  payload?: string;
  timestamp: number;
}

class CoordinatorCluster {
  private nodes = new Map<number, CoordinatorNode>();
  private leaderId: number = 5;
  private logs: ElectionTrace[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.nodes.clear();
    for (let i = 1; i <= 5; i++) {
      this.nodes.set(i, {
        id: i,
        name: `Placement-Coordinator Node ${i}`,
        weight: i * 10,
        status: i === 5 ? 'leader' : 'active',
        lastBeacon: Date.now(),
      });
    }
    this.leaderId = 5;
    this.logs = [];
  }

  getClusterState() {
    return {
      nodes: Array.from(this.nodes.values()),
      currentLeader: this.leaderId,
      recentTraces: this.logs.slice(-20),
    };
  }

  setNodeStatus(nodeId: number, status: NodeState) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = status;
      if (status === 'leader') {
        this.leaderId = nodeId;
      }
    }
  }

  runBullyElection(initiatorId: number): { winner: number; traces: ElectionTrace[] } {
    const traces: ElectionTrace[] = [];
    const activeNodes = Array.from(this.nodes.values()).filter((n) => n.status !== 'crashed');
    const higherNodes = activeNodes.filter((n) => n.id > initiatorId);

    // Step 1: Initiator sends ELECTION to all higher ID nodes
    for (const target of higherNodes) {
      const trace: ElectionTrace = {
        id: crypto.randomUUID(),
        from: initiatorId,
        to: target.id,
        type: 'ELECTION',
        payload: `ELECTION message sent to higher Node ${target.id}`,
        timestamp: Date.now(),
      };
      traces.push(trace);
      this.logs.push(trace);
    }

    if (higherNodes.length === 0) {
      // Initiator is highest -> becomes leader
      this.setLeader(initiatorId);
      const coordTrace: ElectionTrace = {
        id: crypto.randomUUID(),
        from: initiatorId,
        to: 0,
        type: 'COORDINATOR',
        payload: `Node ${initiatorId} has highest ID and declared itself COORDINATOR`,
        timestamp: Date.now(),
      };
      traces.push(coordTrace);
      this.logs.push(coordTrace);
      return { winner: initiatorId, traces };
    }

    // Step 2: Higher nodes send OK back
    for (const higher of higherNodes) {
      const okTrace: ElectionTrace = {
        id: crypto.randomUUID(),
        from: higher.id,
        to: initiatorId,
        type: 'OK',
        payload: `OK/ANSWER from higher Node ${higher.id}`,
        timestamp: Date.now(),
      };
      traces.push(okTrace);
      this.logs.push(okTrace);
    }

    // Highest active node takes over
    const winner = higherNodes.reduce((max, n) => (n.id > max.id ? n : max), higherNodes[0]);
    this.setLeader(winner.id);

    const announceTrace: ElectionTrace = {
      id: crypto.randomUUID(),
      from: winner.id,
      to: 0,
      type: 'COORDINATOR',
      payload: `Node ${winner.id} won the Bully Election and is now the new COORDINATOR!`,
      timestamp: Date.now(),
    };
    traces.push(announceTrace);
    this.logs.push(announceTrace);

    return { winner: winner.id, traces };
  }

  private setLeader(newLeaderId: number) {
    this.leaderId = newLeaderId;
    for (const [id, node] of this.nodes.entries()) {
      if (node.status !== 'crashed') {
        node.status = id === newLeaderId ? 'leader' : 'active';
      }
    }
  }
}

export const cluster = new CoordinatorCluster();
