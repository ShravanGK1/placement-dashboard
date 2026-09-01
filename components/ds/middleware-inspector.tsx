"use client";

import { useState } from "react";
import { Search, Globe, Shield, Activity, Clock } from "lucide-react";

export default function MiddlewareInspector() {
  const [requestLog, setRequestLog] = useState<any[]>([]);

  const makeRequest = async (path: string, auth: boolean = false) => {
    try {
      const headers: any = {};
      if (auth) headers['Authorization'] = 'Bearer mock-token';

      const start = Date.now();
      const res = await fetch(path, { headers });
      const duration = Date.now() - start;

      const log = {
        id: res.headers.get('x-request-id') || crypto.randomUUID().substring(0, 8),
        path,
        status: res.status,
        duration: res.headers.get('x-execution-time') || `${duration}ms`,
        auth,
        time: new Date()
      };

      setRequestLog(prev => [log, ...prev].slice(0, 10));
    } catch (e) {}
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Search className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Middleware & API Tracing</h2>
            <p className="text-sm text-slate-400">Request ID correlation & Rate Limiting.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/50">
            <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> API Route Wrappers
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Test the `withAuth` and `withRateLimit` decorators applied to our API handlers.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => makeRequest('/api/ds/health', false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                Public Endpoint (/health)
              </button>
              <button 
                onClick={() => makeRequest('/api/ds/messages', true)}
                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" /> Authenticated Request (/messages)
              </button>
              <button 
                onClick={() => {
                  for(let i=0; i<20; i++) makeRequest('/api/ds/health', false);
                }}
                className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Activity className="w-4 h-4" /> Trigger Rate Limit (Burst)
              </button>
            </div>
          </div>
        </div>

        {/* Trace Log */}
        <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 flex flex-col overflow-hidden relative">
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-medium text-slate-400 uppercase tracking-wider">
            <span>Trace Log</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> X-Execution-Time</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {requestLog.length > 0 ? requestLog.map((log, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 text-xs animate-in slide-in-from-right-4 fade-in duration-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      log.status === 200 ? 'bg-emerald-500/20 text-emerald-400' :
                      log.status === 429 ? 'bg-amber-500/20 text-amber-400' :
                      log.status === 401 ? 'bg-rose-500/20 text-rose-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {log.status}
                    </span>
                    <span className="font-mono text-slate-300">{log.path}</span>
                  </div>
                  <span className="text-slate-500">{log.duration}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/50">
                  <span className="font-mono text-slate-500 flex items-center gap-1">
                    <span className="text-slate-600">ID:</span> {log.id}
                  </span>
                  <span className="text-[10px] text-slate-600">{log.time.toLocaleTimeString()}</span>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm">
                No requests traced yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
