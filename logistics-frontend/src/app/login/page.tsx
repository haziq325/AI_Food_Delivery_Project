"use client";

import { useState } from "react";
import { Shield, Lock, User, Loader2, Globe } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/restaurants";
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-secondary flex flex-col items-center justify-center p-6 command-center-bg">
      <div className="mb-12 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center mb-4 shadow-sm">
          <Shield className="text-white h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-secondary tracking-widest uppercase mb-1">Relational Logistics AI</h1>
        <p className="text-secondary/70 text-xs font-mono tracking-wider uppercase">Command Center Terminal v4.0.2</p>
      </div>

      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl p-8 shadow-sm relative overflow-hidden">
        {/* Network Secure Status */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Network Secure</span>
          </div>
          <div className="flex items-center text-[10px] font-mono text-secondary/70">
            <Globe className="h-3 w-3 mr-1" />
            192.168.0.1
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-secondary/70 uppercase mb-2 tracking-widest">Employee Identity (Email)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/50" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="identity@network.ai"
                className="w-full bg-white/40 border border-secondary/10 rounded-md py-3 pl-10 pr-4 text-sm text-secondary placeholder:text-secondary/50 focus:border-primary outline-none transition-all font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary/70 uppercase mb-2 tracking-widest">Access Protocol (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/50" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/40 border border-secondary/10 rounded-md py-3 pl-10 pr-4 text-sm text-secondary focus:border-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-md shadow-lg shadow-primary/20 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Validating...
              </>
            ) : (
              "Authorize Access"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-secondary/10 flex justify-between items-center text-[10px] font-mono text-secondary/60">
          <span className="hover:text-primary cursor-pointer">Recover Key</span>
          <span className="hover:text-primary cursor-pointer">Protocol: Auth/V2</span>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
      </div>
    </div>
  );
}
