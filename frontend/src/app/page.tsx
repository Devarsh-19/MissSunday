export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-float" style={{ animationDuration: '10s' }}>
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Welcome back, <span className="text-gradient">Alex</span></h1>
        <p className="text-neutral-400">Here's your morning briefing and platform overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Morning Briefing Card */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.4)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:bg-blue-500/30 group-hover:scale-110"></div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="text-3xl">☀️</span> Morning Briefing
          </h2>
          <div className="space-y-5 text-neutral-300 relative z-10 leading-relaxed">
            <p><strong className="text-white">OpenAI News:</strong> OpenAI recently released a new reasoning model that excels at complex multi-step workflows. Market response has been highly positive.</p>
            <p><strong className="text-white">System Status:</strong> All background agents (Scout, Verify, Ranker) are operating normally. 15 new articles were ingested this morning.</p>
            <p><strong className="text-white">Action Items:</strong> You have 3 unread high-priority alerts regarding cloud infrastructure scaling.</p>
          </div>
          <button className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 font-medium hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]">
            Read Full Briefing
          </button>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
            <h3 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">Agents Active</h3>
            <p className="text-5xl font-bold text-gradient">5</p>
          </div>
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
            <h3 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">Items Ranked</h3>
            <p className="text-5xl font-bold text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">142</p>
          </div>
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(74,222,128,0.2)]">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
            <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">System Health</h3>
            <div className="inline-flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
              <span className="text-lg font-semibold text-green-400">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
