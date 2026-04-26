"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff, Zap, User, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [locationNodeId, setLocationNodeId] = useState("");
  const [nodes, setNodes] = useState<{ node_id: number; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/nodes/`)
      .then((res) => res.json())
      .then((data) => setNodes(data))
      .catch((err) => console.error("Failed to load nodes", err));
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationNodeId) {
      setError("Please select a delivery location.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, location_node_id: parseInt(locationNodeId) }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/home");
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen food-grain-bg flex">
      {/* Left Panel — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-1/2 bg-[#B77466] p-16 relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-[#B77466]" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Swift<span className="font-black">Bite</span>
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-black text-white leading-tight mb-6"
          >
            Cravings,<br />
            <span className="text-[#FFE1AF]">Delivered.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/75 text-lg leading-relaxed max-w-sm"
          >
            AI-powered routing ensures your food arrives hot, fresh, and faster than ever.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 grid grid-cols-3 gap-6"
        >
          {[
            { value: "25+", label: "Restaurants" },
            { value: "A*", label: "AI Routing" },
            { value: "<15m", label: "Avg. Delivery" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs text-white/60 uppercase tracking-widest font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Panel — Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#B77466] rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#957C62] tracking-tight">
              Swift<span className="text-[#B77466]">Bite</span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-[#957C62] mb-2">Create an account</h2>
          <p className="text-[#957C62]/60 mb-10 font-medium">Join SwiftBite for lightning fast deliveries.</p>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#957C62]/70 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#957C62]/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full glass-card rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#957C62] placeholder:text-[#957C62]/35 focus:outline-none focus:border-[#B77466] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#957C62]/70 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#957C62]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full glass-card rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#957C62] placeholder:text-[#957C62]/35 focus:outline-none focus:border-[#B77466] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#957C62]/70 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#957C62]/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full glass-card rounded-xl py-3.5 pl-11 pr-12 text-sm text-[#957C62] placeholder:text-[#957C62]/35 focus:outline-none focus:border-[#B77466] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#957C62]/40 hover:text-[#957C62] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#957C62]/70 uppercase tracking-widest mb-2">
                Delivery Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#957C62]/40" />
                <select
                  value={locationNodeId}
                  onChange={(e) => setLocationNodeId(e.target.value)}
                  required
                  className="w-full glass-card rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#957C62] appearance-none bg-white focus:outline-none focus:border-[#B77466] transition-all"
                >
                  <option value="" disabled>Select your area</option>
                  {nodes.map((node) => (
                    <option key={node.node_id} value={node.node_id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                {/* Custom select arrow */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-[#957C62]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-500 font-medium bg-red-50 border border-red-100 rounded-lg px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full bg-[#B77466] hover:bg-[#9c6052] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#B77466]/25 transition-all text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
               <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up for SwiftBite"
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-xs text-[#957C62]/50">
            Already have an account?{" "}
            <Link href="/login" className="text-[#B77466] font-semibold hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
