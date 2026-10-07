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
import Link from "next/link";
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
  ArrowLeft,
} from "lucide-react";

export default function DistributedSystemsDemo() {
  const [activeTab, setActiveTab] = useState("election");

  const tabs = [
    { id: "election", label: "Leader Election & Beacons", icon: <Crown className="w-4 h-4" /> },
    { id: "sync", label: "Clocks & Vector Time", icon: <Clock className="w-4 h-4" /> },
    { id: "mutex", label: "Mutex & Deadlock", icon: <Lock className="w-4 h-4" /> },
    { id: "paradigms", label: "Global State & Serverless", icon: <Cloud className="w-4 h-4" /> },
    { id: "middleware", label: "Middleware Trace", icon: <Network className="w-4 h-4" /> },
    { id: "rpc", label: "JSON-RPC", icon: <Server className="w-4 h-4" /> },
    { id: "pubsub", label: "Message Broker", icon: <Layers className="w-4 h-4" /> },
    { id: "stream", label: "SSE Stream", icon: <Activity className="w-4 h-4" /> },
    { id: "webrtc", label: "WebRTC P2P", icon: <Phone className="w-4 h-4" /> },
    { id: "fault", label: "Fault Tolerance", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                Distributed Systems Workbench (FA-2)
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Comprehensive interactive simulations for <strong>Unit III (Synchronization)</strong> & <strong>Unit IV (Emerging Paradigms)</strong>.
              </p>
            </div>
          </div>

          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "bg-slate-900/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span className={activeTab === tab.id ? "text-indigo-400" : ""}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active View Container */}
        <div className="flex-1 relative min-h-[620px]">
          {/* Decorative background glow based on active tab */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10 transition-colors duration-700"></div>

          <div className="h-full animate-in fade-in zoom-in-95 duration-300">
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
    </div>
  );
}
