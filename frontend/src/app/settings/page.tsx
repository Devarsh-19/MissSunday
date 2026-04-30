"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function Settings() {
  const [preferences, setPreferences] = useState("Highly values enterprise software and AI scalability. Prefers bullet points and concise professional tone.");

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-1000 pb-20">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4">
          <Save size={10} /> Configuration Interface
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
          Neural <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-neutral-400 mt-2 text-lg font-medium">Fine-tune how the Miss Sunday agent swarm prioritizes your intelligence streams.</p>
      </header>

      <div className="glass-panel rounded-[2.5rem] p-10 md:p-12 space-y-10 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-purple-600/20 transition-all duration-700"></div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-black text-white uppercase tracking-[0.2em]">Agent Personalization Directives</label>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Active across all nodes</span>
            </div>
            <textarea
              rows={6}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white text-lg focus:outline-none focus:border-purple-500/50 transition-all resize-none shadow-inner leading-relaxed placeholder-neutral-600"
              placeholder="Deploy specific instructions for the Ranker and Personalization agents..."
            />
            <p className="text-xs text-neutral-500 mt-4 font-medium leading-relaxed italic">
              * These directives are injected into the context window of every verification and ranking cycle.
            </p>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Save className="text-neutral-400" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">Sync State</span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Ready to commit changes</span>
              </div>
            </div>
            
            <button className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black hover:scale-105 active:scale-95 px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-white/5 uppercase tracking-widest">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
