"use client";

import { useEffect, useState, useRef } from "react";
import { Activity, Radio, Cpu, Users, Briefcase } from "lucide-react";

export default function StreamVisualizer() {
  const [connected, setConnected] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const toggleConnection = () => {
    if (connected) {
      eventSourceRef.current?.close();
      setConnected(false);
    } else {
      const source = new EventSource("/api/ds/stream");
      
      source.addEventListener("connected", (e) => {
        setConnected(true);
        addEvent({ type: "connection", data: "SSE Stream Established", time: new Date() });
      });

      source.addEventListener("telemetry", (e) => {
        const data = JSON.parse(e.data);
        setTelemetry(data);
        addEvent({ type: "telemetry", data: "Received system telemetry ping", time: new Date() });
      });

      source.onerror = () => {
        addEvent({ type: "error", data: "Connection lost, attempting reconnect...", time: new Date() });
        setConnected(false);
      };

      eventSourceRef.current = source;
    }
  };

  const addEvent = (evt: any) => {
    setEvents(prev => [evt, ...prev].slice(0, 8)); // keep last 8
  };

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Radio className={`w-5 h-5 text-emerald-400 ${connected ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Server-Sent Events Stream</h2>
            <p className="text-sm text-slate-400">Real-time unidirectional telemetry ticker.</p>
          </div>
        </div>
        <button 
          onClick={toggleConnection}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            connected 
              ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
          {connected ? 'Disconnect' : 'Connect Stream'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Telemetry Dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <MetricCard 
              icon={<Users className="w-5 h-5 text-sky-400" />} 
              label="Active Connections" 
              value={telemetry?.metrics?.activeConnections || "--"} 
            />
            <MetricCard 
              icon={<Cpu className="w-5 h-5 text-rose-400" />} 
              label="CPU Usage" 
              value={telemetry?.metrics?.cpuUsage || "--"} 
            />
            <MetricCard 
              icon={<Activity className="w-5 h-5 text-indigo-400" />} 
              label="Memory Usage" 
              value={telemetry?.metrics?.memoryUsage || "--"} 
            />
          </div>
          
          <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800/50 p-6 flex flex-col justify-center relative overflow-hidden">
             {/* Fancy visualizer background */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
             </div>
             
             <div className="text-center z-10">
               <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Live Placements Pulse</div>
               <div className="flex items-end justify-center gap-8">
                 <div className="text-center">
                   <div className="text-5xl font-light text-emerald-400 mb-1">{telemetry?.placements?.recentOffers || "0"}</div>
                   <div className="text-xs text-slate-500 uppercase flex items-center justify-center gap-1"><Briefcase className="w-3 h-3" /> Recent Offers</div>
                 </div>
                 <div className="text-center">
                   <div className="text-5xl font-light text-sky-400 mb-1">{telemetry?.placements?.totalInterviewsToday || "0"}</div>
                   <div className="text-xs text-slate-500 uppercase">Interviews Today</div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="lg:col-span-4 bg-slate-950/50 rounded-xl border border-slate-800/50 flex flex-col overflow-hidden">
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 text-xs font-medium text-slate-400 uppercase tracking-wider">
            Event Log
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {events.length > 0 ? events.map((evt, i) => (
              <div key={i} className="flex gap-3 text-xs animate-in fade-in slide-in-from-left-2 duration-300">
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  evt.type === 'error' ? 'bg-rose-500' : 
                  evt.type === 'connection' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}></div>
                <div>
                  <div className="text-slate-300">{evt.data}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5">{evt.time.toLocaleTimeString()}</div>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-600 text-sm py-8">No events yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center gap-2">
      <div className="p-2 bg-slate-900 rounded-full">{icon}</div>
      <div className="text-2xl font-semibold text-slate-200">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
