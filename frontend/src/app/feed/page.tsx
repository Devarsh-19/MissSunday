"use client";

import { useEffect, useState, FormEvent } from "react";

type FeedItem = {
  id: string;
  title: string;
  description: string;
  url?: string;
  scouted: boolean;
  verified: boolean;
  rank: number;
  timestamp: string;
};

export default function LiveFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchNews = async (searchQuery: string = "", forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      const baseUrl = searchQuery ? `http://localhost:8000/api/v1/news?query=${encodeURIComponent(searchQuery)}` : `http://localhost:8000/api/v1/news`;
      const url = forceRefresh ? `${baseUrl}${searchQuery ? '&' : '?'}refresh=true` : baseUrl;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.news && Array.isArray(data.news)) {
        const fetchedNews: FeedItem[] = data.news.map((item: any, index: number) => ({
          id: `news-${Date.now()}-${index}`,
          title: item.title,
          description: item.content || item.snippet || "No description available.",
          url: item.url,
          scouted: true,
          verified: true,
          rank: index + 1,
          timestamp: new Date().toISOString()
        }));
        
        // We replace the feed with the search results, keeping breaking alerts separate if needed
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
    // Fetch initial general news
    fetchNews();

    const ws = new WebSocket("ws://localhost:8000/ws/feed");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ALERT" && data.message) {
          setFeed(prev => [{
            id: Date.now().toString(),
            title: data.message,
            description: "Live breaking alert intercepted by the Scout agent.",
            scouted: true,
            verified: false,
            rank: 1,
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
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchNews(keyword, false);
  };

  const handleRefresh = () => {
    fetchNews(keyword, true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-float" style={{ animationDuration: '12s' }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live News Feed</h1>
        <p className="text-neutral-400">Latest intelligence gathered by the Scout Agent in real-time.</p>
      </header>

      <div className="flex flex-col gap-2 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filter news by keyword (e.g., Technology, Markets, Sports)..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
          <button 
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Refresh
          </button>
        </form>
        {lastFetched && (
          <div className="text-sm text-neutral-500 self-end px-2">
            Last fetched: {lastFetched}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isLoading && feed.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">Fetching latest news...</div>
        ) : feed.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">No news found for this keyword.</div>
        ) : (
          feed.map((item, index) => (
            <div key={item.id} className="glass-panel rounded-xl p-6 hover:bg-white/5 transition-all border border-white/5 hover:border-white/20">
              <div className="flex justify-between items-start mb-3">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-white/90 hover:text-purple-400 transition-colors">
                  {item.title}
                </a>
                {item.rank && (
                  <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded shrink-0 ml-4">Rank #{item.rank}</span>
                )}
              </div>
              <p className="text-neutral-400 mb-4 line-clamp-3">
                {item.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                {item.scouted && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Scouted
                  </span>
                )}
                {item.verified ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div> Pending Verification
                  </span>
                )}
                <span className="ml-auto text-xs text-neutral-600">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
