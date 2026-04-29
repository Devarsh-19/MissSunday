"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export default function Ticker() {
  const [latestAlert, setLatestAlert] = useState<string | null>(null);

  useEffect(() => {
    // Request notification permissions
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws/feed";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ALERT" && data.message) {
          setLatestAlert(data.message);

          // Trigger browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Miss Sunday AI Alert", {
              body: data.message,
              icon: "/favicon.ico"
            });
          }
        }
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!latestAlert) return null;

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-blue-600/20 border-b border-blue-500/30 py-2 px-4 flex items-center overflow-hidden z-50 backdrop-blur-md">
      <div className="flex items-center gap-2 text-blue-400 font-semibold whitespace-nowrap mr-4 shrink-0">
        <Bell size={16} className="animate-pulse" />
        LIVE ALERT
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap text-white/90 font-mono text-sm">
          {latestAlert}
        </div>
      </div>
    </div>
  );
}
