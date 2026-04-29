"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Rss, MessageSquare, Settings, LogOut } from "lucide-react";

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
    <div className="w-64 h-screen glass-panel fixed left-0 top-0 border-r border-[var(--glass-border)] flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gradient tracking-tight">Miss Sunday AI</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive
                  ? "bg-blue-500/10 text-white border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)] rounded-r-full"></div>
              )}
              <Icon size={20} className={isActive ? "text-blue-400" : "group-hover:scale-110 transition-transform"} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--glass-border)]">
        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </div>
  );
}
