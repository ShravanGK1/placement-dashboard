"use client";

import { useState } from "react";
import { Lock, Unlock, ShieldAlert, Play, RotateCcw, AlertOctagon, CheckCircle2, ArrowRight } from "lucide-react";

interface MutexNode {
  id: number;
  name: string;
  state: "RELEASED" | "WANTED" | "HELD";
  timestamp: number;
  repliesReceived: number;
  deferredReplies: number[];
}

interface WFGNode {
  id: string;
  name: string;
  holdingResource: string | null;
  waitingForResource: string | null;
}

export default function MutexDeadlockVisualizer() {
  const [activeTab, setActiveTab] = useState<"mutex" | "deadlock">("mutex");

  // --- 1. Ricart-Agrawala Mutual Exclusion State ---
  const [mutexNodes, setMutexNodes] = useState<MutexNode[]>([
    { id: 1, name: "Placement Pod A (Google)", state: "RELEASED", timestamp: 0, repliesReceived: 0, deferredReplies: [] },
    { id: 2, name: "Placement Pod B (Microsoft)", state: "RELEASED", timestamp: 0, repliesReceived: 0, deferredReplies: [] },
    { id: 3, name: "Placement Pod C (Amazon)", state: "RELEASED", timestamp: 0, repliesReceived: 0, deferredReplies: [] },
  ]);
  const [mutexLogs, setMutexLogs] = useState<string[]>([]);
  const [globalLogicalClock, setGlobalLogicalClock] = useState<number>(1);

  const logMutex = (msg: string) => {
    setMutexLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Node requests Critical Section (CS)
  const requestCS = (nodeId: number) => {
    const nextClock = globalLogicalClock + 1;
    setGlobalLogicalClock(nextClock);

    setMutexNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          logMutex(`Node ${node.id} (${node.name}) wants CS with Lamport Timestamp T=${nextClock}. Broadcasting REQUEST to all other nodes.`);
          return {
            ...node,
            state: "WANTED",
            timestamp: nextClock,
            repliesReceived: 0,
            deferredReplies: [],
          };
        }
        return node;
      })
    );

    // Simulate reply exchanges from other nodes
    setTimeout(() => {
      setMutexNodes((currentNodes) => {
        const requester = currentNodes.find((n) => n.id === nodeId);
        if (!requester) return currentNodes;

        let replies = 0;
        const otherNodes = currentNodes.filter((n) => n.id !== nodeId);

        otherNodes.forEach((other) => {
          if (other.state === "RELEASED") {
            replies++;
            logMutex(`Node ${other.id} is RELEASED -> Immediately sent REPLY to Node ${nodeId}.`);
          } else if (other.state === "HELD") {
            logMutex(`Node ${other.id} is HELD in CS -> DEFERRED reply to Node ${nodeId}.`);
          } else if (other.state === "WANTED") {
            // Compare timestamps
            if (requester.timestamp < other.timestamp || (requester.timestamp === other.timestamp && requester.id < other.id)) {
              replies++;
              logMutex(`Node ${requester.id} (T=${requester.timestamp}) has higher priority than Node ${other.id} (T=${other.timestamp}) -> Node ${other.id} sent REPLY.`);
            } else {
              logMutex(`Node ${other.id} (T=${other.timestamp}) has higher priority -> Node ${other.id} DEFERRED reply to Node ${nodeId}.`);
            }
          }
        });

        if (replies === currentNodes.length - 1) {
          logMutex(`Node ${nodeId} received ALL ${replies} replies -> ENTERING CRITICAL SECTION!`);
          return currentNodes.map((n) => (n.id === nodeId ? { ...n, state: "HELD", repliesReceived: replies } : n));
        }

        return currentNodes.map((n) => (n.id === nodeId ? { ...n, repliesReceived: replies } : n));
      });
    }, 600);
  };

  // Node leaves Critical Section (CS)
  const releaseCS = (nodeId: number) => {
    logMutex(`Node ${nodeId} finished interview round & EXITED Critical Section. Sending deferred replies to waiting nodes.`);
    setMutexNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          return { ...node, state: "RELEASED", timestamp: 0, repliesReceived: 0, deferredReplies: [] };
        }
        return node;
      })
    );
  };

  // --- 2. Knapp's Edge-Chasing Deadlock Detection State ---
  const [wfg, setWfg] = useState<WFGNode[]>([
    { id: "P1", name: "Recruiter 1", holdingResource: "Room A", waitingForResource: "Panelist 2" },
    { id: "P2", name: "Recruiter 2", holdingResource: "Panelist 2", waitingForResource: "Room B" },
    { id: "P3", name: "Recruiter 3", holdingResource: "Room B", waitingForResource: "Room A" },
  ]);

  const [probeLogs, setProbeLogs] = useState<string[]>([]);
  const [deadlockDetected, setDeadlockDetected] = useState<boolean>(false);

  const runEdgeChasingProbe = () => {
    setProbeLogs([]);
    setDeadlockDetected(false);

    // Chandy-Misra-Haas Edge-Chasing probe simulation
    const steps = [
      "1. Process P1 is blocked waiting for 'Panelist 2' (held by P2).",
      "2. P1 initiates probe message: PROBE(initiator: P1, sender: P1, receiver: P2).",
      "3. P2 receives probe from P1. P2 is blocked waiting for 'Room B' (held by P3).",
      "4. P2 propagates probe: PROBE(initiator: P1, sender: P2, receiver: P3).",
      "5. P3 receives probe. P3 is blocked waiting for 'Room A' (held by P1).",
      "6. P3 propagates probe: PROBE(initiator: P1, sender: P3, receiver: P1).",
      "7. CRITICAL: Probe returned to original initiator P1! [P1 -> P2 -> P3 -> P1 cycle confirmed].",
      "8. DEADLOCK DETECTED (Knapp's Edge-Chasing Model).",
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProbeLogs((prev) => [...prev, step]);
        if (idx === steps.length - 1) {
          setDeadlockDetected(true);
        }
      }, idx * 600);
    });
  };

  const resolveDeadlock = () => {
    setWfg((prev) =>
      prev.map((node) => {
        if (node.id === "P3") {
          return { ...node, waitingForResource: null };
        }
        return node;
      })
    );
    setDeadlockDetected(false);
    setProbeLogs((prev) => [...prev, "RESOLVED: Preempted Process P3's lock request. Circular wait broken."]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col gap-6 overflow-y-auto">
      {/* Top Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">
              Mutual Exclusion & Deadlock Detection (Unit III & Self-Study)
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Interactive simulation of <strong>Ricart-Agrawala Algorithm</strong> & <strong>Knapp&apos;s Edge-Chasing Deadlock Detection</strong>.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("mutex")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "mutex" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Ricart-Agrawala Mutex (2(N-1))
          </button>
          <button
            onClick={() => setActiveTab("deadlock")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "deadlock" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Knapp&apos;s Deadlock (Edge-Chasing)
          </button>
        </div>
      </div>

      {activeTab === "mutex" ? (
        /* Ricart Agrawala Mutex Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left: Pods Competing for Critical Section */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Shared Critical Section (Campus Auditorium Slot)
                </span>
                <span className="text-xs text-slate-400">
                  Global Clock: <strong className="text-indigo-400 font-mono">{globalLogicalClock}</strong>
                </span>
              </div>

              {/* Critical Section Box */}
              <div className="p-4 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-950/20 flex items-center justify-center gap-3">
                {mutexNodes.some((n) => n.state === "HELD") ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <Lock className="w-5 h-5" />
                    LOCKED BY: {mutexNodes.find((n) => n.state === "HELD")?.name}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Unlock className="w-5 h-5" />
                    SLOT FREE (Available for booking)
                  </div>
                )}
              </div>
            </div>

            {/* Competing Node Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mutexNodes.map((node) => {
                const isHeld = node.state === "HELD";
                const isWanted = node.state === "WANTED";

                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isHeld
                        ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : isWanted
                        ? "bg-amber-950/30 border-amber-500 animate-pulse"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{node.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isHeld
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isWanted
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {node.state}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1 mb-4 font-mono">
                        <p>Req Time: <span className="text-white">{node.timestamp || "-"}</span></p>
                        <p>Replies: <span className="text-indigo-400">{node.repliesReceived} / 2</span></p>
                      </div>
                    </div>

                    <div>
                      {node.state === "RELEASED" && (
                        <button
                          onClick={() => requestCS(node.id)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-all"
                        >
                          Request CS Lock
                        </button>
                      )}
                      {node.state === "WANTED" && (
                        <button
                          disabled
                          className="w-full py-1.5 bg-amber-900/40 text-amber-300 rounded text-xs font-medium border border-amber-800"
                        >
                          Waiting for Replies...
                        </button>
                      )}
                      {node.state === "HELD" && (
                        <button
                          onClick={() => releaseCS(node.id)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-all"
                        >
                          Release CS Lock
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Message Exchange Logs */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-800">
              Ricart-Agrawala Message Exchange Logs
            </span>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px]">
              {mutexLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">
                  Click &quot;Request CS Lock&quot; to begin Ricart-Agrawala distributed coordination.
                </p>
              ) : (
                mutexLogs.map((log, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Knapp's Deadlock Edge-Chasing Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left: Wait-For Graph (WFG) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Wait-For Graph (WFG) Topology
              </span>

              <div className="grid grid-cols-3 gap-3">
                {wfg.map((node) => (
                  <div
                    key={node.id}
                    className={`p-3 rounded-lg border text-xs ${
                      deadlockDetected
                        ? "bg-rose-950/30 border-rose-800"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <span className="font-bold text-white block mb-1">{node.name} ({node.id})</span>
                    <p className="text-[11px] text-slate-400">
                      Holds: <strong className="text-emerald-400">{node.holdingResource || "None"}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Waits For: <strong className="text-amber-400">{node.waitingForResource || "None"}</strong>
                    </p>
                  </div>
                ))}
              </div>

              {deadlockDetected && (
                <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800 rounded-lg flex items-center justify-between text-xs text-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>Circular Wait Detected: <strong>P1 → P2 → P3 → P1</strong></span>
                  </div>
                  <button
                    onClick={resolveDeadlock}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold text-xs"
                  >
                    Preempt & Resolve
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={runEdgeChasingProbe}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Run Chandy-Misra-Haas Edge-Chasing Probe
              </button>
            </div>
          </div>

          {/* Right: Edge-Chasing Probe Execution Logs */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-800">
              Edge-Chasing Probe Propagation Log
            </span>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px]">
              {probeLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">
                  Click &quot;Run Edge-Chasing Probe&quot; to send probe tokens along dependency edges.
                </p>
              ) : (
                probeLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded border text-[11px] font-mono ${
                      log.includes("DEADLOCK")
                        ? "bg-rose-950/60 border-rose-800 text-rose-300 font-bold"
                        : log.includes("RESOLVED")
                        ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
