"use client";

import { useState } from "react";
import { Camera, HardDrive, Zap, Play, CheckCircle2, Server, Cloud, ArrowRight, RotateCcw } from "lucide-react";

export default function ParadigmsVisualizer() {
  const [activeTab, setActiveTab] = useState<"snapshot" | "dfs" | "serverless">("snapshot");

  // --- 1. Chandy-Lamport Snapshot State ---
  const [nodeBalances, setNodeBalances] = useState<{ A: number; B: number; C: number }>({
    A: 10, // 10 offers allocated
    B: 15,
    C: 8,
  });
  const [channelMessages, setChannelMessages] = useState<{ from: string; to: string; amount: number }[]>([]);
  const [snapshotState, setSnapshotState] = useState<{
    recordedNodes: Record<string, number | null>;
    recordedChannels: Record<string, number>;
    isConsistent: boolean;
  } | null>(null);

  const transferOffer = (from: "A" | "B" | "C", to: "A" | "B" | "C", amount: number) => {
    if (nodeBalances[from] < amount) return;
    setNodeBalances((prev) => ({ ...prev, [from]: prev[from] - amount }));
    setChannelMessages((prev) => [...prev, { from, to, amount }]);

    setTimeout(() => {
      setChannelMessages((prev) => prev.filter((m) => !(m.from === from && m.to === to && m.amount === amount)));
      setNodeBalances((prev) => ({ ...prev, [to]: prev[to] + amount }));
    }, 2500);
  };

  const takeChandyLamportSnapshot = () => {
    // Record current node balances
    const recordedNodes = {
      A: nodeBalances.A,
      B: nodeBalances.B,
      C: nodeBalances.C,
    };

    // In-flight channel messages captured
    const inFlightSum = channelMessages.reduce((sum, m) => sum + m.amount, 0);

    setSnapshotState({
      recordedNodes,
      recordedChannels: { "In-flight Offers": inFlightSum },
      isConsistent: true,
    });
  };

  // --- 2. DFS / HDFS Simulator State ---
  const [uploadedResume, setUploadedResume] = useState<string>("Shravan_Resume_Final.pdf");
  const [chunks, setChunks] = useState<
    { id: string; name: string; replicas: number[]; size: string }[]
  >([
    { id: "blk_101", name: "Block 0 (0-64KB: Profile & Summary)", replicas: [1, 2, 3], size: "64 KB" },
    { id: "blk_102", name: "Block 1 (64-128KB: Projects & Skills)", replicas: [2, 3, 4], size: "64 KB" },
    { id: "blk_103", name: "Block 2 (128-192KB: Work History)", replicas: [1, 3, 4], size: "48 KB" },
  ]);
  const [deadDataNode, setDeadDataNode] = useState<number | null>(null);

  const killDataNode = (nodeId: number) => {
    setDeadDataNode(nodeId);
    // Simulate NameNode automatic re-replication to survive fault
    setTimeout(() => {
      setChunks((prev) =>
        prev.map((chunk) => {
          if (chunk.replicas.includes(nodeId)) {
            const availableNodes = [1, 2, 3, 4].filter((n) => n !== nodeId && !chunk.replicas.includes(n));
            const newReplica = availableNodes[0] || 1;
            return {
              ...chunk,
              replicas: chunk.replicas.map((r) => (r === nodeId ? newReplica : r)),
            };
          }
          return chunk;
        })
      );
    }, 1200);
  };

  // --- 3. Serverless Execution Simulator State ---
  const [invocationType, setInvocationType] = useState<"cold" | "warm">("warm");
  const [lambdaExecutionLogs, setLambdaExecutionLogs] = useState<string[]>([]);

  const invokeServerlessFunction = (type: "cold" | "warm") => {
    setInvocationType(type);
    const startMs = Date.now();
    const initLatency = type === "cold" ? 340 : 8;
    const execDuration = 45;

    const logs = [
      `[T+0ms] HTTP Request received at Edge API Gateway Route /api/recruiter/offer`,
      type === "cold"
        ? `[T+12ms] COLD START: Provisioning new MicroVM container (Node.js 22 runtime)... (+${initLatency}ms)`
        : `[T+2ms] WARM HIT: Reusing existing idle Lambda container instance... (+${initLatency}ms)`,
      `[T+${initLatency}ms] Loading MongoDB client promise from global cache...`,
      `[T+${initLatency + 20}ms] Executing business logic: Generate placement offer letter...`,
      `[T+${initLatency + execDuration}ms] Response 200 OK returned. Execution cost billed: ${initLatency + execDuration}ms ($0.0000007).`,
      `[T+${initLatency + execDuration + 5}ms] Container returned to warm pool (Keep-alive for 15 minutes).`,
    ];

    setLambdaExecutionLogs(logs);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">
              Global State & Emerging Distributed Paradigms (Unit III & IV)
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Interactive demonstrations of <strong>Chandy-Lamport Snapshot</strong>, <strong>Distributed File System (HDFS/DFS)</strong>, and <strong>Serverless FaaS</strong>.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("snapshot")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "snapshot" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Chandy-Lamport Snapshot
          </button>
          <button
            onClick={() => setActiveTab("dfs")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "dfs" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            DFS Resume Storage (HDFS)
          </button>
          <button
            onClick={() => setActiveTab("serverless")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === "serverless" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Serverless FaaS Architecture
          </button>
        </div>
      </div>

      {/* Tab 1: Chandy-Lamport Distributed Snapshot */}
      {activeTab === "snapshot" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Distributed Placement Nodes (Offer Pool)
                </span>
                <span className="text-xs text-indigo-400 font-medium">
                  Total Offers in System: 33
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {(["A", "B", "C"] as const).map((node) => (
                  <div key={node} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                    <span className="font-bold text-white block mb-1">Placement Node {node}</span>
                    <p className="text-slate-400">
                      Balance: <strong className="text-indigo-400 font-mono text-sm">{nodeBalances[node]}</strong> offers
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => transferOffer(node, node === "A" ? "B" : node === "B" ? "C" : "A", 2)}
                        disabled={nodeBalances[node] < 2}
                        className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] w-full disabled:opacity-40"
                      >
                        Send 2 Offers →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* In-flight FIFO channels */}
              <div className="p-3 bg-slate-900/60 border border-dashed border-slate-800 rounded-lg text-xs">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase">
                  In-Flight Messages in FIFO Channels:
                </span>
                {channelMessages.length === 0 ? (
                  <span className="text-slate-500 italic">No in-flight offer tokens currently on channels.</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {channelMessages.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-mono animate-pulse"
                      >
                        {m.from} → {m.to} ({m.amount} offers in transit)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={takeChandyLamportSnapshot}
              className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Trigger Chandy-Lamport Marker Snapshot
            </button>
          </div>

          {/* Snapshot Verification Box */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-800">
              Recorded Consistent Cut Verification
            </span>

            {snapshotState ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Consistent Global Snapshot Recorded!
                  </div>
                  <p className="text-[11px] text-emerald-400/80">
                    No ghost messages or lost messages detected across the cut boundary.
                  </p>
                </div>

                <div className="space-y-1.5 font-mono text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <p>Node A State: <span className="text-white font-bold">{snapshotState.recordedNodes.A}</span></p>
                  <p>Node B State: <span className="text-white font-bold">{snapshotState.recordedNodes.B}</span></p>
                  <p>Node C State: <span className="text-white font-bold">{snapshotState.recordedNodes.C}</span></p>
                  <p>Channel State: <span className="text-amber-400 font-bold">{snapshotState.recordedChannels["In-flight Offers"]}</span></p>
                  <hr className="border-slate-800 my-1" />
                  <p className="text-indigo-400 font-bold">
                    Global Total: {
                      (snapshotState.recordedNodes.A || 0) +
                      (snapshotState.recordedNodes.B || 0) +
                      (snapshotState.recordedNodes.C || 0) +
                      snapshotState.recordedChannels["In-flight Offers"]
                    } / 33 offers
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">
                Click &quot;Trigger Chandy-Lamport Marker Snapshot&quot; to capture consistent global state.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Distributed File System (DFS / HDFS) */}
      {activeTab === "dfs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  NameNode Metadata: {uploadedResume} (176 KB)
                </span>
              </div>

              {/* Chunk distribution */}
              <div className="space-y-2">
                {chunks.map((chk) => (
                  <div key={chk.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{chk.name}</span>
                      <p className="text-[11px] text-slate-500 font-mono">Block ID: {chk.id} ({chk.size})</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Replicas (3x):</span>
                      {chk.replicas.map((r) => (
                        <span
                          key={r}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                            r === deadDataNode
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          }`}
                        >
                          DataNode {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated DataNodes */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((nodeId) => {
                const isDead = deadDataNode === nodeId;
                return (
                  <div
                    key={nodeId}
                    className={`p-3 rounded-lg border text-center text-xs ${
                      isDead
                        ? "bg-rose-950/30 border-rose-800 text-rose-300"
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="font-bold block mb-1">DataNode {nodeId}</span>
                    <button
                      onClick={() => (isDead ? setDeadDataNode(null) : killDataNode(nodeId))}
                      className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded"
                    >
                      {isDead ? "Revive" : "Kill Node"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 pb-2 border-b border-slate-800">
              DFS Architecture Principles
            </span>
            <ul className="space-y-2 text-slate-400 text-xs list-disc pl-4">
              <li><strong>Metadata Separation:</strong> Master NameNode manages block mapping; client streams raw data directly to DataNodes.</li>
              <li><strong>Replication Factor (3x):</strong> Protects placement resumes against disk corruption or worker failures.</li>
              <li><strong>Heartbeat Recovery:</strong> When DataNode fails, NameNode schedules automatic re-replication to maintain rack awareness.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Serverless FaaS Architecture */}
      {activeTab === "serverless" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Serverless FaaS Execution Testbench
              </span>

              <p className="text-xs text-slate-400 mb-4">
                Execute a Next.js App Router API lambda route to compare <strong>Cold Start initialization</strong> vs <strong>Warm container execution</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => invokeServerlessFunction("cold")}
                  className="p-3 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800 rounded-lg text-left"
                >
                  <span className="text-xs font-bold text-amber-300 block mb-1">1. Cold Start Lambda</span>
                  <p className="text-[11px] text-slate-400">MicroVM provision + module load (~350ms)</p>
                </button>

                <button
                  onClick={() => invokeServerlessFunction("warm")}
                  className="p-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800 rounded-lg text-left"
                >
                  <span className="text-xs font-bold text-emerald-300 block mb-1">2. Warm Container Hit</span>
                  <p className="text-[11px] text-slate-400">Instant cache invocation (~8ms)</p>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3 pb-2 border-b border-slate-800">
              Serverless Telemetry & Execution Lifecycle
            </span>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {lambdaExecutionLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">
                  Select Cold Start or Warm Hit to simulate FaaS execution logs.
                </p>
              ) : (
                lambdaExecutionLogs.map((log, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
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
