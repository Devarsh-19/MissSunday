"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, Info } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@misssunday.ai");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      if (email === "admin@misssunday.ai" && password === "admin123") {
        router.push("/");
      } else {
        setError("Invalid credentials. Please use the demo account.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative w-full h-full -ml-8 -mt-8">
      {/* Background Blobs for Login specifically */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-3 tracking-tight">Miss Sunday</h1>
            <p className="text-neutral-400">Welcome back. Log in to your agent console.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-neutral-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-neutral-600"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
