"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, RotateCcw, Radio, Shield, Zap, ArrowRight } from "lucide-react";

type NodeStatus = "active" | "crashed" | "electing" | "leader";

interface Node {
  id: number;
  name: string;
  status: NodeStatus;
  lastBeacon: number;
}

interface MessageTrace {
  id: string;
  from: number;
  to: number;
  type: "ELECTION" | "OK" | "COORDINATOR" | "BEACON" | "TOKEN";
  payload?: string;
  timestamp: string;
}

export default function ElectionVisualizer() {
  const [algorithm, setAlgorithm] = useState<"bully" | "ring">("bully");
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, name: "Coordinator-Node 1", status: "active", lastBeacon: Date.now() },
    { id: 2, name: "Coordinator-Node 2", status: "active", lastBeacon: Date.now() },
    { id: 3, name: "Coordinator-Node 3", status: "active", lastBeacon: Date.now() },
    { id: 4, name: "Coordinator-Node 4", status: "active", lastBeacon: Date.now() },
    { id: 5, name: "Coordinator-Node 5 (Leader)", status: "leader", lastBeacon: Date.now() },
  ]);

  const [messageLogs, setMessageLogs] = useState<MessageTrace[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [beaconEnabled, setBeaconEnabled] = useState(true);
  const [currentLeader, setCurrentLeader] = useState<number>(5);
  const beaconTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Beacon protocol simulation (Heartbeat)
  useEffect(() => {
    if (!beaconEnabled) {
      if (beaconTimerRef.current) clearInterval(beaconTimerRef.current);
      return;
    }

    beaconTimerRef.current = setInterval(() => {
      const leaderNode = nodes.find((n) => n.id === currentLeader);
      if (leaderNode && leaderNode.status === "leader") {
        setNodes((prev) =>
          prev.map((n) => (n.id === currentLeader ? { ...n, lastBeacon: Date.now() } : n))
        );
      }
    }, 2000);

    return () => {
      if (beaconTimerRef.current) clearInterval(beaconTimerRef.current);
    };
  }, [beaconEnabled, currentLeader, nodes]);

  const logMessage = (from: number, to: number, type: MessageTrace["type"], payload?: string) => {
    setMessageLogs((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        from,
        to,
        type,
        payload,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 19),
    ]);
  };

  const toggleCrashNode = (nodeId: number) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const nextStatus = node.status === "crashed" ? "active" : "crashed";
          return { ...node, status: nextStatus };
        }
        return node;
      })
    );
  };

  // Bully Algorithm Execution
  const runBullyElection = async (initiatorId: number) => {
    if (isSimulating) return;
    setIsSimulating(true);

    const activeNodes = nodes.filter((n) => n.status !== "crashed");
    const initiator = nodes.find((n) => n.id === initiatorId);
    if (!initiator || initiator.status === "crashed") {
      setIsSimulating(false);
      return;
    }

    // Set electing state
    setNodes((prev) =>
      prev.map((n) => (n.id === initiatorId ? { ...n, status: "electing" } : n))
    );

    // Step 1: Send ELECTION to all higher ID nodes
    const higherNodes = activeNodes.filter((n) => n.id > initiatorId);

    for (const target of higherNodes) {
      logMessage(initiatorId, target.id, "ELECTION", `Election request from Node ${initiatorId}`);
    }

    await new Promise((r) => setTimeout(r, 900));

    if (higherNodes.length === 0) {
      // Initiator is highest active node -> Becomes Leader
      announceLeader(initiatorId);
      setIsSimulating(false);
      return;
    }

    // Step 2: Higher nodes send OK back
    for (const higher of higherNodes) {
      logMessage(higher.id, initiatorId, "OK", `OK / Answer from Node ${higher.id}`);
    }

    await new Promise((r) => setTimeout(r, 900));

    // Highest among active nodes takes over
    const highestActiveNode = higherNodes.reduce((max, n) => (n.id > max.id ? n : max), higherNodes[0]);

    // Send ELECTION from highest active node
    logMessage(highestActiveNode.id, 0, "COORDINATOR", `Node ${highestActiveNode.id} won the election!`);
    announceLeader(highestActiveNode.id);

    setIsSimulating(false);
  };

  // Ring Algorithm Execution (Chang & Roberts)
  const runRingElection = async (initiatorId: number) => {
    if (isSimulating) return;
    setIsSimulating(true);

    const sortedNodes = [...nodes].sort((a, b) => a.id - b.id);
    let activeRing = sortedNodes.filter((n) => n.status !== "crashed");

    if (activeRing.length === 0) {
      setIsSimulating(false);
      return;
    }

    let tokenList = [initiatorId];
    logMessage(initiatorId, initiatorId, "TOKEN", `Initiating Ring Election with list [${tokenList.join(",")}]`);

    // Pass token around the ring
    const initIdx = activeRing.findIndex((n) => n.id === initiatorId);
    if (initIdx === -1) {
      setIsSimulating(false);
      return;
    }

    for (let i = 1; i <= activeRing.length; i++) {
      const fromNode = activeRing[(initIdx + i - 1) % activeRing.length];
      const toNode = activeRing[(initIdx + i) % activeRing.length];

      if (!tokenList.includes(fromNode.id)) {
        tokenList.push(fromNode.id);
      }

      logMessage(fromNode.id, toNode.id, "TOKEN", `Active Nodes: [${tokenList.join(", ")}]`);
      await new Promise((r) => setTimeout(r, 600));
    }

    // Leader is max ID in tokenList
    const winnerId = Math.max(...tokenList);
    logMessage(initiatorId, 0, "COORDINATOR", `Ring Complete. Highest ID ${winnerId} is Coordinator!`);
    announceLeader(winnerId);

    setIsSimulating(false);
  };

  const announceLeader = (leaderId: number) => {
    setCurrentLeader(leaderId);
    setNodes((prev) =>
      prev.map((n) => {
        if (n.status === "crashed") return n;
        return {
          ...n,
          status: n.id === leaderId ? "leader" : "active",
        };
      })
    );
  };

  const resetAll = () => {
    setNodes([
      { id: 1, name: "Coordinator-Node 1", status: "active", lastBeacon: Date.now() },
      { id: 2, name: "Coordinator-Node 2", status: "active", lastBeacon: Date.now() },
      { id: 3, name: "Coordinator-Node 3", status: "active", lastBeacon: Date.now() },
      { id: 4, name: "Coordinator-Node 4", status: "active", lastBeacon: Date.now() },
      { id: 5, name: "Coordinator-Node 5 (Leader)", status: "leader", lastBeacon: Date.now() },
    ]);
    setCurrentLeader(5);
    setMessageLogs([]);
    setIsSimulating(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col gap-6 overflow-y-auto">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">
              Leader Election & Beacon Protocol (Unit III)
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Simulate <strong>Bully Algorithm</strong>, <strong>Ring Algorithm</strong>, and periodic heartbeat beacons among placement coordinator nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setAlgorithm("bully")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                algorithm === "bully" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Bully Algorithm (O(N²))
            </button>
            <button
              onClick={() => setAlgorithm("ring")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                algorithm === "ring" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Ring Algorithm (O(N))
            </button>
          </div>

          <button
            onClick={resetAll}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Main Grid: Nodes Visualizer vs Packet Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Nodes Topology & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Distributed Coordinator Nodes Topology
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBeaconEnabled(!beaconEnabled)}
                className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  beaconEnabled
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                <Radio className={`w-3 h-3 ${beaconEnabled ? "animate-pulse text-emerald-400" : ""}`} />
                Beacon Protocol: {beaconEnabled ? "Broadcasting (2s)" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Node Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {nodes.map((node) => {
              const isLeader = node.status === "leader";
              const isCrashed = node.status === "crashed";
              const isElecting = node.status === "electing";

              return (
                <div
                  key={node.id}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isLeader
                      ? "bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10"
                      : isCrashed
                      ? "bg-rose-950/20 border-rose-900/50 opacity-70"
                      : isElecting
                      ? "bg-indigo-950/40 border-indigo-500 animate-pulse"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isLeader
                            ? "bg-amber-500 text-black"
                            : isCrashed
                            ? "bg-rose-900 text-rose-300"
                            : "bg-slate-800 text-indigo-400"
                        }`}
                      >
                        N{node.id}
                      </div>
                      <span className="text-xs font-semibold text-white">Node {node.id}</span>
                    </div>

                    {isLeader && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                        <Crown className="w-3 h-3" /> LEADER
                      </span>
                    )}
                    {isCrashed && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40 font-bold">
                        CRASHED
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">
                    Priority / Weight: <strong className="text-slate-200">{node.id * 10}</strong>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCrashNode(node.id)}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-all ${
                        isCrashed
                          ? "bg-emerald-900/50 border-emerald-700 text-emerald-200 hover:bg-emerald-800"
                          : "bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900"
                      }`}
                    >
                      {isCrashed ? "Revive" : "Crash Node"}
                    </button>

                    {!isCrashed && !isLeader && (
                      <button
                        onClick={() =>
                          algorithm === "bully"
                            ? runBullyElection(node.id)
                            : runRingElection(node.id)
                        }
                        disabled={isSimulating}
                        className="py-1 px-2 rounded text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
                      >
                        Trigger
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Instruction Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">How to test:</span>
              <p className="text-slate-400 mt-0.5">
                1. Click <strong>&quot;Crash Node&quot;</strong> on <strong>Node 5 (Leader)</strong> to simulate coordinator failure.
                <br />
                2. Click <strong>&quot;Trigger&quot;</strong> on any alive node (e.g. Node 2) to start an election via {algorithm === "bully" ? "Bully Algorithm" : "Ring Algorithm"}.
              </p>
            </div>
          </div>
        </div>

        {/* Message Trace & Packet Inspector */}
        <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Live Protocol Packet Trace
            </span>
            <span className="text-[11px] text-slate-500">{messageLogs.length} events</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[350px]">
            {messageLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
                <Radio className="w-8 h-8 mb-2 opacity-30" />
                No election messages in flight yet.
              </div>
            ) : (
              messageLogs.map((msg) => (
                <div
                  key={msg.id}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        msg.type === "COORDINATOR"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : msg.type === "ELECTION"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : msg.type === "OK"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {msg.type}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <span className="text-slate-400">Node {msg.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-indigo-400">
                      {msg.to === 0 ? "BROADCAST ALL" : `Node ${msg.to}`}
                    </span>
                  </div>

                  {msg.payload && <p className="text-slate-400 text-[11px]">{msg.payload}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
