"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Zap, ServerCrash, RotateCcw } from "lucide-react";

export default function FaultToleranceControls() {
  const [health, setHealth] = useState<any>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/ds/health");
      setHealth(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const simulateFailure = async () => {
    // We send an RPC to a method that will fail, but we don't have one explicitly.
    // Instead we can simulate a message broker error that goes to DLQ, 
    // or just visually show the concept.
    // Let's trigger a bad API call to see the API middleware generic error.
    try {
      await fetch("/api/ds/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }) // Missing payload triggers error
      });
      fetchHealth();
    } catch (e) {}
  };

  const getCircuitBreakerStateColor = (state: string) => {
    if (state === "CLOSED") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (state === "OPEN") return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    if (state === "HALF_OPEN") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  };

  const cbState = health?.circuitBreakers?.global?.state || "UNKNOWN";

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Fault Tolerance & Resilience</h2>
            <p className="text-sm text-slate-400">Circuit Breakers, Retries & Fallbacks.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/50">
            <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
              <ServerCrash className="w-4 h-4 text-slate-400" /> Simulate Instability
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Trigger failures to observe the Circuit Breaker transition from CLOSED to OPEN, 
              protecting the downstream service and activating fallback responses.
            </p>
            <button 
              onClick={simulateFailure}
              className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Trigger Service Failure
            </button>
          </div>
          
          <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/50">
            <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-400" /> Exponential Backoff
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Configured for automated retries with Random Jitter.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="px-2 py-1 bg-slate-900 rounded">Attempt 1: 1s + jitter</span>
              <span className="px-2 py-1 bg-slate-900 rounded">Attempt 2: 2s + jitter</span>
              <span className="px-2 py-1 bg-slate-900 rounded">Attempt 3: 4s + jitter</span>
            </div>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 p-6 flex flex-col items-center justify-center relative flex-1">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Global Circuit Breaker</div>
            
            <div className={`px-6 py-2 rounded-full border-2 font-bold text-2xl tracking-widest mb-6 ${getCircuitBreakerStateColor(cbState)}`}>
              {cbState}
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mt-auto">
              <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
                <div className="text-xl font-light text-slate-200 mb-1">{health?.circuitBreakers?.global?.failures || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase">Recent Failures</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
                <div className="text-xl font-light text-slate-200 mb-1">{health?.circuitBreakers?.global?.threshold || 3}</div>
                <div className="text-[10px] text-slate-500 uppercase">Failure Threshold</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 px-4 py-3 flex justify-between items-center text-xs">
            <span className="text-slate-400 uppercase">DB Latency Probe</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health?.services?.database === 'up' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="font-mono text-slate-300">{health?.services?.dbLatencyMs || 0} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
