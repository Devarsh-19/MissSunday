"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Rss, MessageSquare, Settings, LogOut, Sparkles } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Live Feed", href: "/feed", icon: Rss },
    { name: "Ask Miss Sunday", href: "/chat", icon: MessageSquare },
    { name: "Preferences", href: "/settings", icon: Settings },
  ];

  if (pathname === "/login") return null;

  return (
    <div className="w-64 h-screen glass-panel fixed left-0 top-0 border-r border-white/5 flex flex-col z-50 shadow-2xl overflow-hidden">
      {/* Decorative Glow behind logo */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="p-10 relative z-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white to-blue-400 flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Sparkles size={20} className="text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Miss</h1>
            <h1 className="text-xl font-black text-blue-500 tracking-tighter uppercase leading-none">Sunday</h1>
          </div>
        </div>
        <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-transparent"></div>
      </div>

      <nav className="flex-1 px-4 space-y-3 mt-6 relative z-10">
        <p className="px-5 text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Command Center</p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 relative overflow-hidden group ${isActive
                  ? "bg-white text-black shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] scale-[1.02]"
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
                }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-black/5" : "bg-transparent group-hover:bg-white/10"}`}>
                <Icon size={18} className={`${isActive ? "text-black" : "group-hover:scale-110 group-hover:rotate-12 transition-all"} stroke-[2.5px]`} />
              </div>
              <span className="font-bold text-[13px] tracking-tight">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-6 relative z-10 bg-gradient-to-t from-black/20 to-transparent">
        <div className="flex items-center gap-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-white/10 flex items-center justify-center text-xs font-black text-white">
            AD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black text-white truncate">Alex Director</span>
            <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span> Authorized
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-3 px-5 py-3 rounded-2xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 font-bold text-xs uppercase tracking-widest border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} />
          <span>Terminate Session</span>
        </Link>
      </div>
    </div>
  );
}
