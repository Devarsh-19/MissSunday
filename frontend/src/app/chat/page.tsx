"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, ShieldCheck } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: "user" | "assistant";
  content: string;
  verification_status?: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am Miss Sunday, your multi-agent AI assistant. I have access to live web search and fact-checking capabilities. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws/chat";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chunk") {
          setMessages(prev => {
            const newMsgs = [...prev];
            const last = newMsgs[newMsgs.length - 1];
            if (last && last.role === "assistant") {
              // Create a new object instead of mutating the existing one to prevent StrictMode double-invocation bugs
              newMsgs[newMsgs.length - 1] = {
                ...last,
                content: last.content + data.content
              };
            } else {
              newMsgs.push({ role: "assistant", content: data.content });
            }
            return newMsgs;
          });
        } else if (data.type === "done") {
          setIsLoading(false);
        } else if (data.type === "error") {
          setMessages(prev => [...prev, { role: "assistant", content: "Error: " + data.content }]);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Error parsing chat websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection to the backend lost. Please refresh." }]);
      return;
    }

    const userMessage = input;
    setInput("");

    // Add user message and empty assistant message
    setMessages(prev => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" }
    ]);

    setIsLoading(true);

    wsRef.current.send(JSON.stringify({ message: userMessage }));
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col pb-8 animate-in fade-in duration-1000">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">
            <ShieldCheck size={10} /> Neural Link Secured
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
            Intelligence <span className="text-gradient">Portal</span>
          </h1>
          <p className="text-neutral-400 mt-2 text-lg font-medium">Direct interface with the Miss Sunday agent swarm.</p>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="flex -space-x-2">
            {["S", "V", "R"].map((n, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-[10px] font-black text-white">
                {n}
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Agents Standby</span>
            <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span> Ready to analyze
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl border-white/5">
        {/* Animated Background Highlights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 relative z-10 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-6 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both`} style={{ animationDelay: `${i * 100}ms` }}>
              {msg.role === "assistant" && (
                <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center shrink-0 border border-white/10 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Bot size={28} className="text-white relative z-10" />
                </div>
              )}

              <div className={`group relative max-w-[80%] rounded-[2rem] p-8 transition-all duration-500 ${msg.role === "user"
                  ? "bg-white text-black shadow-2xl font-medium rounded-tr-sm"
                  : "bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-tl-sm text-neutral-200 hover:border-white/20"
                }`}>
                
                {msg.role === "assistant" ? (
                  <div className="markdown-prose prose-invert">
                    {msg.content === "" && isLoading ? (
                      <div className="flex gap-2 items-center h-8">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-lg font-bold">{msg.content}</p>
                )}

                {msg.verification_status && (
                  <div className="mt-8 pt-6 border-t border-black/10 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-1">Scout Verification Node</span>
                      <span className="text-sm font-medium text-neutral-400 italic">"{msg.verification_status}"</span>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-14 h-14 rounded-[1.2rem] bg-neutral-800 flex items-center justify-center shrink-0 border border-white/10 shadow-2xl">
                  <User size={28} className="text-neutral-400" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-8 md:p-10 bg-gradient-to-t from-black/60 to-transparent border-t border-white/5 relative z-10">
          <form onSubmit={sendMessage} className="relative flex items-center max-w-4xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-0 group-focus-within:opacity-20 transition duration-1000"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deploy a complex intelligence query..."
              className="relative w-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 rounded-[1.8rem] py-6 md:py-7 pl-8 pr-20 focus:outline-none focus:border-blue-500/50 transition-all text-white text-lg placeholder-neutral-500 shadow-2xl backdrop-blur-xl"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-4 p-4 rounded-2xl bg-white text-black hover:scale-105 active:scale-95 disabled:bg-neutral-800 disabled:text-neutral-600 transition-all shadow-xl shadow-white/10 group/btn"
            >
              <Send size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </button>
          </form>
          <p className="text-center mt-6 text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
            Neural Encryption Standard AES-256 Enabled
          </p>
        </div>
      </div>
    </div>
  );
}
