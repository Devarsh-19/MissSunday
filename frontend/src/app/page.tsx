"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, Database, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Dashboard() {
  const [briefing, setBriefing] = useState<{ title: string; update: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [stats, setStats] = useState({
    agents: 5,
    itemsRanked: 142,
    health: "Optimal"
  });

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const fetchBriefing = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/v1/news?category=Technology&summarize=true`);
        const data = await response.json();
        if (data.news && data.news.length > 0) {
          setBriefing({
            title: data.news[0].title,
            update: data.news[0].update
          });
        }
      } catch (e) {
        console.error("Failed to fetch briefing", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefing();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      <header className="space-y-10">
        {/* Unified Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Intelligence Console Active</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-yellow-500" />
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Neural Link: Stable</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 px-4">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Time</div>
              <div className="text-xs font-mono font-black text-white bg-white/5 px-2 py-1 rounded-md">{currentTime || "--:--"}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Security</div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-md border border-green-500/20">
                <ShieldCheck size={12} className="text-green-500" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none">
            Welcome back, <br />
            <span className="text-gradient drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Director Alex</span>
          </h1>
          <div className="flex items-center gap-4 text-neutral-400 text-lg font-medium max-w-2xl">
            <p className="leading-relaxed">Your decentralized agent swarm has analyzed <span className="text-white font-bold">142 intelligence vectors</span> since your last session. All nodes are synchronized and awaiting instruction.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Morning Briefing Card */}
        <div className="lg:col-span-8 group relative">
          <div className="relative glass-panel rounded-[2.5rem] p-10 overflow-hidden h-full flex flex-col justify-between border-white/10 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
            
            <div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h2 className="text-2xl font-black flex items-center gap-4 text-white uppercase tracking-tight">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  Morning Briefing
                </h2>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">Sector: Technology</span>
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest animate-pulse px-3">Live Analysis</span>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-white/5 rounded-xl w-3/4"></div>
                  <div className="h-24 bg-white/5 rounded-2xl w-full"></div>
                </div>
              ) : briefing ? (
                <div className="space-y-6 relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 group-hover:text-blue-200 transition-colors">
                    {briefing.title}
                  </h3>
                  <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-blue-500/20 transition-all duration-300">
                    <div className="markdown-prose text-neutral-300 text-lg leading-relaxed italic">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {briefing.update}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500 italic">No intelligence updates gathered yet. System is scanning...</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-white/5">
              <Link href="/feed" className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95">
                View Full Briefing <ArrowRight size={18} />
              </Link>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border border-black flex items-center justify-center text-[8px] font-bold">S</div>
                    <div className="w-6 h-6 rounded-full bg-purple-500 border border-black flex items-center justify-center text-[8px] font-bold">V</div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Intelligence Verified</span>
                </div>
                <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                  Updated: {currentTime || "Just now"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="card-lift glass-panel rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Activity size={20} />
              </div>
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">Agents Active</h3>
            </div>
            <p className="text-6xl font-black text-gradient tracking-tighter">{stats.agents}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> All Systems Nominal
            </div>
          </div>

          <div className="card-lift glass-panel rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Database size={20} />
              </div>
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">Data Processed</h3>
            </div>
            <p className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">{stats.itemsRanked}</p>
            <div className="mt-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Items analyzed this session</div>
          </div>

          <div className="card-lift glass-panel rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-600/10 rounded-full blur-2xl group-hover:bg-green-600/20 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">System Health</h3>
            </div>
            <div className="inline-flex items-center gap-3 bg-green-500/10 px-5 py-3 rounded-2xl border border-green-500/20">
              <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.8)]"></span>
              <span className="text-xl font-black text-green-400 uppercase tracking-tight">{stats.health}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
