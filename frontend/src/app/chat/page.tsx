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
    const ws = new WebSocket("ws://localhost:8000/ws/chat");
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
    <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-6 ml-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <Bot className="text-blue-400" size={28} />
          </div>
          <span className="text-gradient">Ask Miss Sunday</span>
        </h1>
        <p className="text-neutral-400 mt-2 ml-1">Powered by LangGraph streaming workflows.</p>
      </header>

      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col relative shadow-2xl shadow-blue-900/10 border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative z-10 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              {msg.role === "assistant" && (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                  <Bot size={24} className="text-blue-300" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-3xl p-6 shadow-md ${msg.role === "user"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                  : "bg-black/60 border border-white/10 backdrop-blur-md rounded-tl-sm text-neutral-200"
                }`}>
                
                {msg.role === "assistant" ? (
                  <div className="markdown-prose">
                    {msg.content === "" && isLoading ? (
                      <div className="flex gap-1.5 items-center h-6">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}

                {msg.verification_status && (
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-start gap-2 text-sm text-green-400 bg-green-500/5 p-3 rounded-xl">
                    <ShieldCheck size={18} className="shrink-0" />
                    <div>
                      <span className="font-semibold text-green-300">Verified Fact Check:</span> <span className="opacity-90">{msg.verification_status}</span>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                  <User size={24} className="text-neutral-400" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-5 md:p-6 bg-black/60 border-t border-white/10 backdrop-blur-xl relative z-10">
          <form onSubmit={sendMessage} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Miss Sunday a complex question..."
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-4 md:py-5 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-neutral-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 transition-all shadow-lg group"
            >
              <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
