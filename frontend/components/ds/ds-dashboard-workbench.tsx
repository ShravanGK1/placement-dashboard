"use client";

import { useState } from "react";
import RpcWorkbench from "@/components/ds/rpc-workbench";
import MessageQueueVisualizer from "@/components/ds/message-queue-visualizer";
import StreamVisualizer from "@/components/ds/stream-visualizer";
import P2PWebRTCRoom from "@/components/ds/p2p-webrtc-room";
import FaultToleranceControls from "@/components/ds/fault-tolerance-controls";
import MiddlewareInspector from "@/components/ds/middleware-inspector";
import ElectionVisualizer from "@/components/ds/election-visualizer";
import SynchronizationVisualizer from "@/components/ds/synchronization-visualizer";
import MutexDeadlockVisualizer from "@/components/ds/mutex-deadlock-visualizer";
import ParadigmsVisualizer from "@/components/ds/paradigms-visualizer";
import {
  Network,
  Server,
  Activity,
  Phone,
  ShieldAlert,
  Layers,
  Crown,
  Clock,
  Lock,
  Cloud,
  Sparkles,
} from "lucide-react";

interface DsDashboardWorkbenchProps {
  initialTab?: string;
  onClose?: () => void;
}

export default function DsDashboardWorkbench({ initialTab = "election" }: DsDashboardWorkbenchProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: "election", label: "Leader Election & Beacons", icon: <Crown className="w-4 h-4" /> },
    { id: "sync", label: "Clocks & Vector Time", icon: <Clock className="w-4 h-4" /> },
    { id: "mutex", label: "Mutex & Deadlock Detection", icon: <Lock className="w-4 h-4" /> },
    { id: "paradigms", label: "Global State & Paradigms", icon: <Cloud className="w-4 h-4" /> },
    { id: "middleware", label: "Middleware Trace & Headers", icon: <Network className="w-4 h-4" /> },
    { id: "rpc", label: "JSON-RPC Engine", icon: <Server className="w-4 h-4" /> },
    { id: "pubsub", label: "Message Broker (Pub/Sub)", icon: <Layers className="w-4 h-4" /> },
    { id: "stream", label: "SSE Live Stream", icon: <Activity className="w-4 h-4" /> },
    { id: "webrtc", label: "WebRTC P2P Room", icon: <Phone className="w-4 h-4" /> },
    { id: "fault", label: "Fault Tolerance", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-xl overflow-hidden font-sans">
      {/* Top Banner */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                  Distributed Systems Workbench (FA-2)
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Embedded Engine
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Interactive real-time simulations for <strong>Unit III (Synchronization)</strong> and <strong>Unit IV (Emerging Paradigms)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 mt-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Content View */}
      <div className="p-4 md:p-6 bg-slate-950/90 relative min-h-[600px]">
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {activeTab === "election" && <ElectionVisualizer />}
          {activeTab === "sync" && <SynchronizationVisualizer />}
          {activeTab === "mutex" && <MutexDeadlockVisualizer />}
          {activeTab === "paradigms" && <ParadigmsVisualizer />}
          {activeTab === "middleware" && <MiddlewareInspector />}
          {activeTab === "rpc" && <RpcWorkbench />}
          {activeTab === "pubsub" && <MessageQueueVisualizer />}
          {activeTab === "stream" && <StreamVisualizer />}
          {activeTab === "webrtc" && <P2PWebRTCRoom />}
          {activeTab === "fault" && <FaultToleranceControls />}
        </div>
      </div>
    </div>
  );
}
