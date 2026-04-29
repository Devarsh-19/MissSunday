"use client";

import { useEffect, useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type FeedItem = {
  id: string;
  title: string;
  update: string;
  url?: string;
  source: string;
  category: string;
  timestamp: string;
};

const CATEGORIES = ["World", "Technology", "Business", "Science", "Health", "Sports"];

export default function LiveFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("World");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchNews = async (category: string = "World", searchQuery: string = "", forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let url = `${apiUrl}/api/v1/news?summarize=true`;
      
      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      } else {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      if (forceRefresh) {
        url += `&refresh=true`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.news && Array.isArray(data.news)) {
        const fetchedNews: FeedItem[] = data.news.map((item: any, index: number) => ({
          id: `news-${Date.now()}-${index}`,
          title: item.title,
          update: item.update || "No update available.",
          url: item.url,
          source: item.source || "Global Intelligence",
          category: item.category || category,
          timestamp: new Date().toISOString()
        }));
        
        setFeed(fetchedNews);
        if (data.timestamp) {
          setLastFetched(new Date(data.timestamp).toLocaleString());
        }
      }
    } catch (e) {
      console.error("Failed to fetch news", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws/feed";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ALERT" && data.message) {
          setFeed(prev => [{
            id: `alert-${Date.now()}`,
            title: "BREAKING ALERT",
            update: data.message,
            source: "Scout Node Alpha",
            category: "Alert",
            timestamp: new Date().toISOString()
          }, ...prev]);
        }
      } catch (e) {
        console.error("Error parsing feed websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [activeCategory]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchNews(activeCategory, keyword, true);
  };

  const handleRefresh = () => {
    fetchNews(activeCategory, keyword, true);
  };

  return (
    <div className="relative min-h-screen mesh-background overflow-hidden px-4 md:px-8 pb-20">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full animate-float"></div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 pt-12">
        <header className="relative p-12 rounded-[2.5rem] overflow-hidden glass-panel border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Live Intelligence Stream
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                Global <span className="text-gradient">Briefing</span>
              </h1>
              <p className="text-neutral-400 text-lg max-w-xl font-medium leading-relaxed">
                Autonomous agents scouting 4,000+ data nodes to deliver synthesized global updates in real-time.
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? "Syncing Grid..." : "Refresh Stream"}
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-3 p-2.5 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] border border-white/5 sticky top-8 z-40 shadow-2xl">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setKeyword("");
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-white text-black shadow-xl" 
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-8">
          {isLoading && feed.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-[2rem] p-8 h-48 shimmer opacity-50"></div>
            ))
          ) : feed.length === 0 ? (
            <div className="text-center py-32 glass-panel rounded-[2.5rem] border-dashed border-2">
              <div className="text-5xl mb-4">🛰️</div>
              <p className="text-neutral-500 font-bold text-xl">Node signal lost. Try a different sector.</p>
            </div>
          ) : (
            feed.map((item, idx) => (
              <div 
                key={item.id} 
                className="group card-lift glass-panel rounded-[2rem] p-8 md:p-10 border-white/5 hover:border-purple-500/30 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full group-hover:bg-purple-500/10 transition-colors"></div>
                
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-500/20">
                        {item.category}
                      </div>
                      <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
                      <span className="text-neutral-500 text-xs font-bold tracking-tight">
                        {item.source}
                      </span>
                    </div>
                    <time className="text-[10px] font-mono font-bold text-neutral-600 bg-white/5 px-2 py-1 rounded">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-[1.1] tracking-tight group-hover:text-purple-200 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="relative group/text px-2">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="markdown-prose text-neutral-300 text-lg leading-relaxed font-medium">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.update}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 border-2 border-[#05050A] flex items-center justify-center text-[10px] font-black text-white shadow-lg">S</div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-400 border-2 border-[#05050A] flex items-center justify-center text-[10px] font-black text-white shadow-lg">V</div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/90 uppercase tracking-wider">Verified Intel</span>
                        <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Accuracy 98.4%</span>
                      </div>
                    </div>
                    
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 text-xs font-black text-white hover:text-purple-400 transition-all group/link"
                      >
                        Deep Dive
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-white group-hover/link:text-black transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {lastFetched && !isLoading && (
          <div className="flex justify-center pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 backdrop-blur-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              Network Synchronized at {lastFetched}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
