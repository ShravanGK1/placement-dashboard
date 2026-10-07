"use client";

import { useState } from "react";
import { Clock, GitBranch, ArrowRight, RotateCcw, Cpu, Sparkles, Check, HelpCircle } from "lucide-react";

interface TimelineEvent {
  id: string;
  processId: "P1" | "P2" | "P3";
  processName: string;
  action: string;
  lamportTime: number;
  vectorTime: [number, number, number];
  timestamp: string;
}

export default function SynchronizationVisualizer() {
  const [activeSubTab, setActiveSubTab] = useState<"logical" | "physical">("logical");

  // Physical Clock State (Cristian's & Berkeley)
  const [cristianServerTime, setCristianServerTime] = useState<number>(1000);
  const [cristianRtt, setCristianRtt] = useState<number>(40);
  const [cristianResult, setCristianResult] = useState<number | null>(null);

  const [berkeleyMasterTime, setBerkeleyMasterTime] = useState<number>(300);
  const [slaveTimes, setSlaveTimes] = useState<[number, number, number]>([290, 315, 305]);
  const [berkeleyOffsets, setBerkeleyOffsets] = useState<[number, number, number] | null>(null);
  const [berkeleyAvg, setBerkeleyAvg] = useState<number | null>(null);

  // Logical & Vector Clock State
  // P1: Student (index 0), P2: Recruiter (index 1), P3: Officer (index 2)
  const [lamportClocks, setLamportClocks] = useState<[number, number, number]>([0, 0, 0]);
  const [vectorClocks, setVectorClocks] = useState<{
    P1: [number, number, number];
    P2: [number, number, number];
    P3: [number, number, number];
  }>({
    P1: [0, 0, 0],
    P2: [0, 0, 0],
    P3: [0, 0, 0],
  });

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<TimelineEvent[]>([]);

  // Calculate Cristian's Algorithm
  const runCristian = () => {
    // T_new = T_server + (RTT / 2)
    const synced = cristianServerTime + Math.round(cristianRtt / 2);
    setCristianResult(synced);
  };

  // Calculate Berkeley Algorithm
  const runBerkeley = () => {
    const allTimes = [berkeleyMasterTime, ...slaveTimes];
    const avg = Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length);
    setBerkeleyAvg(avg);

    const offsets: [number, number, number] = [
      avg - slaveTimes[0],
      avg - slaveTimes[1],
      avg - slaveTimes[2],
    ];
    setBerkeleyOffsets(offsets);
  };

  // Trigger Action in Logical/Vector Clock system
  const triggerEvent = (
    proc: "P1" | "P2" | "P3",
    actionName: string,
    receivingMsgFrom?: "P1" | "P2" | "P3"
  ) => {
    const pIdx = proc === "P1" ? 0 : proc === "P2" ? 1 : 2;

    // Lamport update: C_i = max(C_i, C_incoming) + 1
    let incomingLamport = 0;
    if (receivingMsgFrom) {
      const fromIdx = receivingMsgFrom === "P1" ? 0 : receivingMsgFrom === "P2" ? 1 : 2;
      incomingLamport = lamportClocks[fromIdx];
    }
    const nextLamport = Math.max(lamportClocks[pIdx], incomingLamport) + 1;

    const newLamports = [...lamportClocks] as [number, number, number];
    newLamports[pIdx] = nextLamport;
    setLamportClocks(newLamports);

    // Vector update: V_i[i]++ and max(V_i[k], V_msg[k])
    const currentV = [...vectorClocks[proc]] as [number, number, number];
    if (receivingMsgFrom) {
      const fromV = vectorClocks[receivingMsgFrom];
      currentV[0] = Math.max(currentV[0], fromV[0]);
      currentV[1] = Math.max(currentV[1], fromV[1]);
      currentV[2] = Math.max(currentV[2], fromV[2]);
    }
    currentV[pIdx] += 1;

    setVectorClocks((prev) => ({
      ...prev,
      [proc]: currentV,
    }));

    const procName =
      proc === "P1" ? "Student (P1)" : proc === "P2" ? "Recruiter (P2)" : "Placement Officer (P3)";

    const newEvt: TimelineEvent = {
      id: Math.random().toString(36).substring(7),
      processId: proc,
      processName: procName,
      action: actionName,
      lamportTime: nextLamport,
      vectorTime: currentV,
      timestamp: new Date().toLocaleTimeString(),
    };

    setEvents((prev) => [newEvt, ...prev.slice(0, 14)]);
  };

  // Select events to compare causality
  const toggleSelectEvent = (evt: TimelineEvent) => {
    if (selectedEvents.some((e) => e.id === evt.id)) {
      setSelectedEvents((prev) => prev.filter((e) => e.id !== evt.id));
    } else {
      if (selectedEvents.length >= 2) {
        setSelectedEvents([selectedEvents[1], evt]);
      } else {
        setSelectedEvents([...selectedEvents, evt]);
      }
    }
  };

  // Evaluate Causality: a -> b, b -> a, or a || b
  const evaluateCausality = () => {
    if (selectedEvents.length < 2) return null;
    const [e1, e2] = selectedEvents;
    const v1 = e1.vectorTime;
    const v2 = e2.vectorTime;

    const v1_le_v2 = v1[0] <= v2[0] && v1[1] <= v2[1] && v1[2] <= v2[2];
    const v1_lt_v2 = v1_le_v2 && (v1[0] < v2[0] || v1[1] < v2[1] || v1[2] < v2[2]);

    const v2_le_v1 = v2[0] <= v1[0] && v2[1] <= v1[1] && v2[2] <= v1[2];
    const v2_lt_v1 = v2_le_v1 && (v2[0] < v1[0] || v2[1] < v1[1] || v2[2] < v1[2]);

    if (v1_lt_v2) {
      return {
        relation: "CAUSAL_PRECEDENCE",
        text: `Event 1 (${e1.action}) causally precedes Event 2 (${e2.action}) [e1 → e2]`,
        color: "text-emerald-400 bg-emerald-950/40 border-emerald-800",
      };
    } else if (v2_lt_v1) {
      return {
        relation: "CAUSAL_PRECEDENCE",
        text: `Event 2 (${e2.action}) causally precedes Event 1 (${e1.action}) [e2 → e1]`,
        color: "text-emerald-400 bg-emerald-950/40 border-emerald-800",
      };
    } else {
      return {
        relation: "CONCURRENT",
        text: `Event 1 and Event 2 are CONCURRENT [e1 ∥ e2] (No causal relationship)`,
        color: "text-amber-400 bg-amber-950/40 border-amber-800",
      };
    }
  };

  const resetLogical = () => {
    setLamportClocks([0, 0, 0]);
    setVectorClocks({ P1: [0, 0, 0], P2: [0, 0, 0], P3: [0, 0, 0] });
    setEvents([]);
    setSelectedEvents([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">
              Clock Synchronization & Logical/Vector Clocks (Unit III)
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Compare <strong>Physical (Cristian & Berkeley)</strong> vs <strong>Logical (Lamport & Vector)</strong> ordering algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSubTab("logical")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeSubTab === "logical" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Logical & Vector Clocks
            </button>
            <button
              onClick={() => setActiveSubTab("physical")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeSubTab === "physical" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Physical Clocks (Cristian & Berkeley)
            </button>
          </div>
        </div>
      </div>

      {/* Logical & Vector Clocks Section */}
      {activeSubTab === "logical" ? (
        <div className="flex flex-col gap-6 flex-1">
          {/* Processes & Interactive Action Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Process P1: Student */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center text-xs font-bold">
                      P1
                    </span>
                    Student Process
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Vector Clock</span>
                    <p className="font-mono text-xs text-cyan-400 font-bold">
                      [{vectorClocks.P1.join(", ")}]
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">Lamport Time: <strong className="text-white">{lamportClocks[0]}</strong></p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => triggerEvent("P1", "Student: Submits Resume")}
                  className="py-1.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 rounded text-xs font-medium text-left"
                >
                  1. Local: Submit Application
                </button>
                <button
                  onClick={() => triggerEvent("P1", "Student: Sends Msg to Recruiter", "P2")}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-medium text-left"
                >
                  2. Msg: Accept Offer from Recruiter (P2)
                </button>
              </div>
            </div>

            {/* Process P2: Recruiter */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-bold">
                      P2
                    </span>
                    Recruiter Process
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Vector Clock</span>
                    <p className="font-mono text-xs text-indigo-400 font-bold">
                      [{vectorClocks.P2.join(", ")}]
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">Lamport Time: <strong className="text-white">{lamportClocks[1]}</strong></p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => triggerEvent("P2", "Recruiter: Shortlists Candidate", "P1")}
                  className="py-1.5 px-3 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 rounded text-xs font-medium text-left"
                >
                  1. Msg: Shortlist after Student (P1)
                </button>
                <button
                  onClick={() => triggerEvent("P2", "Recruiter: Releases Placement Offer")}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-medium text-left"
                >
                  2. Local: Release Placement Offer
                </button>
              </div>
            </div>

            {/* Process P3: Placement Officer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center text-xs font-bold">
                      P3
                    </span>
                    Placement Officer
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Vector Clock</span>
                    <p className="font-mono text-xs text-violet-400 font-bold">
                      [{vectorClocks.P3.join(", ")}]
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">Lamport Time: <strong className="text-white">{lamportClocks[2]}</strong></p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => triggerEvent("P3", "Officer: Verifies CGPA Policy")}
                  className="py-1.5 px-3 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-800/60 text-violet-300 rounded text-xs font-medium text-left"
                >
                  1. Local: Check Eligibility Rules
                </button>
                <button
                  onClick={() => triggerEvent("P3", "Officer: Approves Offer Letter", "P2")}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-medium text-left"
                >
                  2. Msg: Ratify Offer from Recruiter (P2)
                </button>
              </div>
            </div>
          </div>

          {/* Causality Comparison Tool */}
          {selectedEvents.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Vector Clock Causality Detector
                </span>
                <span className="text-[11px] text-slate-500">
                  Select any 2 events from the log below to compare causality
                </span>
              </div>

              {selectedEvents.length === 2 ? (
                <div className={`p-3 rounded-lg border text-xs font-medium ${evaluateCausality()?.color}`}>
                  {evaluateCausality()?.text}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Selected 1 event: <strong>{selectedEvents[0].action}</strong>. Select one more event to evaluate causality ($e_1 \to e_2$ or $e_1 \parallel e_2$).
                </p>
              )}
            </div>
          )}

          {/* Event History Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" /> Distributed Execution History
              </span>
              <button
                onClick={resetLogical}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Clocks
              </button>
            </div>

            <div className="overflow-y-auto max-h-[220px] space-y-1.5">
              {events.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No events recorded yet. Click any button above to generate distributed events.
                </p>
              ) : (
                events.map((e) => {
                  const isSelected = selectedEvents.some((sel) => sel.id === e.id);
                  return (
                    <div
                      key={e.id}
                      onClick={() => toggleSelectEvent(e)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-950/60 border-indigo-500 text-white"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                            e.processId === "P1"
                              ? "bg-cyan-500/20 text-cyan-300"
                              : e.processId === "P2"
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "bg-violet-500/20 text-violet-300"
                          }`}
                        >
                          {e.processId}
                        </span>
                        <span className="font-medium">{e.action}</span>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span className="text-slate-400">
                          Lamport: <strong className="text-slate-200">{e.lamportTime}</strong>
                        </span>
                        <span className="text-slate-400">
                          Vector: <strong className="text-indigo-400">[{e.vectorTime.join(", ")}]</strong>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Physical Clock Sync (Cristian & Berkeley) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Cristian's Algorithm Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Cristian&apos;s Algorithm (Client-Server)</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Formula: $T_{'{new}'} = T_{'{server}'} + \frac{'{RTT}'}{'{2}'}$
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Server Time ($T_{'{server}'}$ in ms):</label>
                  <input
                    type="number"
                    value={cristianServerTime}
                    onChange={(e) => setCristianServerTime(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Measured RTT ($\Delta t$ in ms):</label>
                  <input
                    type="number"
                    value={cristianRtt}
                    onChange={(e) => setCristianRtt(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={runCristian}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all mb-3"
              >
                Compute Synced Client Time
              </button>

              {cristianResult !== null && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800 rounded-lg text-xs">
                  <p className="text-slate-300">
                    Adjusted Client Time: <strong className="text-cyan-300 font-mono text-sm">{cristianResult} ms</strong>
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Estimated error bounds: $\pm {cristianRtt / 2} \text{'{ ms}'}$
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Berkeley Algorithm Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Berkeley Algorithm (Master-Averaging)</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Master polls slave times, computes average (ignoring drift outliers), and sends relative offsets $\Delta t_i$.
              </p>

              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block">Master Time (ms):</label>
                    <input
                      type="number"
                      value={berkeleyMasterTime}
                      onChange={(e) => setBerkeleyMasterTime(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Slave 1 Time (ms):</label>
                    <input
                      type="number"
                      value={slaveTimes[0]}
                      onChange={(e) => setSlaveTimes([Number(e.target.value), slaveTimes[1], slaveTimes[2]])}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Slave 2 Time (ms):</label>
                    <input
                      type="number"
                      value={slaveTimes[1]}
                      onChange={(e) => setSlaveTimes([slaveTimes[0], Number(e.target.value), slaveTimes[2]])}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Slave 3 Time (ms):</label>
                    <input
                      type="number"
                      value={slaveTimes[2]}
                      onChange={(e) => setSlaveTimes([slaveTimes[0], slaveTimes[1], Number(e.target.value)])}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={runBerkeley}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all mb-3"
              >
                Compute Average & Offsets ($\Delta t$)
              </button>

              {berkeleyAvg !== null && berkeleyOffsets !== null && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-800 rounded-lg text-xs space-y-1">
                  <p className="text-slate-300">
                    System Global Average: <strong className="text-indigo-300 font-mono">{berkeleyAvg} ms</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Offsets sent: S1: <span className="text-indigo-300 font-mono">{berkeleyOffsets[0] > 0 ? `+${berkeleyOffsets[0]}` : berkeleyOffsets[0]}ms</span> |
                    S2: <span className="text-indigo-300 font-mono">{berkeleyOffsets[1] > 0 ? `+${berkeleyOffsets[1]}` : berkeleyOffsets[1]}ms</span> |
                    S3: <span className="text-indigo-300 font-mono">{berkeleyOffsets[2] > 0 ? `+${berkeleyOffsets[2]}` : berkeleyOffsets[2]}ms</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
