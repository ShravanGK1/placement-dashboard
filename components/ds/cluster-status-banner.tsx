"use client";

import { useEffect, useState } from "react";
import { Crown, Clock, Activity, ShieldCheck, Zap } from "lucide-react";

interface ClusterStatusBannerProps {
  onOpenWorkbench?: (tab?: string) => void;
  activeTab?: string;
}

export function ClusterStatusBanner({ onOpenWorkbench, activeTab }: ClusterStatusBannerProps) {
  const [logicalClock, setLogicalClock] = useState(142);
  const [leaderId, setLeaderId] = useState(5);
  const [latency, setLatency] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogicalClock((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setLatency(14 + Math.floor(Math.random() * 9));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 text-white rounded-xl p-3.5 border border-indigo-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide">CLUSTER HEALTH</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Leader: <strong className="text-white font-mono">Node-{leaderId}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Lamport Clock: <strong className="text-white font-mono">L(e)={logicalClock}</strong></span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>RPC Latency: <strong className="text-white font-mono">{latency}ms</strong></span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Ricart-Agrawala: <strong className="text-emerald-400">CS Safe</strong></span>
        </div>
      </div>

      {onOpenWorkbench && (
        <button
          onClick={() => onOpenWorkbench("election")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0 ${
            activeTab === "ds"
              ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
              : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{activeTab === "ds" ? "Showing DS Workbench" : "Switch to DS Workbench"}</span>
        </button>
      )}
    </div>
  );
}
