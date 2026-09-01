"use client";

import { useState, useEffect } from "react";
import { Send, Layers, RefreshCw, AlertTriangle, Inbox } from "lucide-react";

export default function MessageQueueVisualizer() {
  const [topic, setTopic] = useState("job.posted");
  const [payload, setPayload] = useState('{"title": "SDE-1", "company": "Google"}');
  const [status, setStatus] = useState<any>(null);
  const [recentMsgs, setRecentMsgs] = useState<any[]>([]);

  const fetchStatus = async () => {
    try {
      const [resStatus, resRecent] = await Promise.all([
        fetch("/api/ds/messages?action=status"),
        fetch(`/api/ds/messages?action=recent&topic=${topic}`)
      ]);
      setStatus(await resStatus.json());
      setRecentMsgs(await resRecent.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [topic]);

  const handlePublish = async () => {
    try {
      const parsed = JSON.parse(payload);
      await fetch("/api/ds/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, payload: parsed })
      });
      fetchStatus();
    } catch (e) {
      alert("Invalid JSON Payload");
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/20 rounded-lg">
            <Layers className="w-5 h-5 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Message Broker Hub</h2>
            <p className="text-sm text-slate-400">Pub/Sub Event Queues & DLQ.</p>
          </div>
        </div>
        <button onClick={fetchStatus} className="p-2 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-slate-200">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Publisher Pane */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Send className="w-3.5 h-3.5" /> Publisher
            </h3>
            <div className="space-y-3">
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              >
                <option value="job.posted">job.posted</option>
                <option value="application.status_changed">application.status_changed</option>
                <option value="notification.broadcast">notification.broadcast</option>
                <option value="error.simulation">error.simulation (Will Fail -&gt; DLQ)</option>
              </select>
              
              <textarea 
                className="w-full h-24 bg-slate-900 font-mono text-xs border border-slate-700 rounded-lg px-3 py-2 text-amber-400 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 resize-none"
                value={payload}
                onChange={e => setPayload(e.target.value)}
              />
              
              <button 
                onClick={handlePublish}
                className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Publish Event
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center">
             <div className="text-center">
               <div className="text-3xl font-light text-slate-200 mb-1">{status?.dlqCount || 0}</div>
               <div className="text-xs text-slate-500 uppercase flex items-center gap-1 justify-center">
                 <AlertTriangle className="w-3 h-3 text-rose-500" /> DLQ Size
               </div>
             </div>
          </div>
        </div>

        {/* Queue Visualizer */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 flex flex-col flex-1 overflow-hidden relative">
             <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <Inbox className="w-3.5 h-3.5" /> Topic: {topic}
                </div>
                <div className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-300">
                  {status?.topics?.[topic] || 0} Messages
                </div>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-3">
               {recentMsgs.length > 0 ? recentMsgs.map((msg, i) => (
                 <div key={msg.id} className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 transform transition-all animate-in slide-in-from-right-4 fade-in duration-300">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-medium text-fuchsia-400">ID: {msg.id.substring(0, 12)}...</span>
                     <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                   </div>
                   <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded break-all overflow-hidden">
                     {JSON.stringify(msg.payload, null, 2)}
                   </pre>
                 </div>
               )) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                   <Inbox className="w-8 h-8 opacity-20" />
                   <p className="text-sm">Queue is empty</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
