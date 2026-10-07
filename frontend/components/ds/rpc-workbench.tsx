"use client";

import { useState } from "react";
import { Play, Activity, Server, FileJson } from "lucide-react";

export default function RpcWorkbench() {
  const [method, setMethod] = useState("placement.getStats");
  const [params, setParams] = useState("{}");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(0);

  const handleExecute = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const parsedParams = params ? JSON.parse(params) : {};
      const res = await fetch("/api/ds/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params: parsedParams,
          id: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (e: any) {
      setResponse({ error: e.message });
    } finally {
      setLatency(Date.now() - start);
      setLoading(false);
    }
  };

  const methods = ["placement.getStats", "system.ping", "application.submit"];

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Server className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-100">JSON-RPC 2.0 Workbench</h2>
          <p className="text-sm text-slate-400">Execute remote procedure calls with precision.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Method</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                if (e.target.value === "application.submit") {
                  setParams(JSON.stringify({ studentId: "S123", jobId: "J456" }, null, 2));
                } else {
                  setParams("{}");
                }
              }}
            >
              {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Parameters (JSON)</label>
            <textarea 
              className="w-full flex-1 min-h-[120px] bg-slate-950 font-mono text-sm border border-slate-800 rounded-lg px-4 py-3 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              value={params}
              onChange={(e) => setParams(e.target.value)}
            />
          </div>

          <button 
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {loading ? "Executing..." : "Execute Call"}
          </button>
        </div>

        <div className="flex flex-col bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden relative">
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <FileJson className="w-3.5 h-3.5" /> Response
            </div>
            {response && (
              <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                {latency}ms
              </div>
            )}
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {response ? (
              <pre className="text-sm font-mono text-cyan-400 whitespace-pre-wrap break-all">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <FileJson className="w-8 h-8 opacity-20" />
                <p className="text-sm">Awaiting execution...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
