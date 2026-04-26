"use client";

import { motion } from "framer-motion";
import RestaurantCard from "@/components/RestaurantCard";
import { LayoutGrid, Map, Activity, Search } from "lucide-react";
import Link from "next/link";

import { getRestaurants } from "@/lib/api";
import { Restaurant } from "@/lib/types";
import { useEffect, useState } from "react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";

export default function RestaurantGallery() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return (
    <div className="min-h-screen text-secondary selection:bg-primary/20">
      {/* Header / Nav */}
      <header className="border-b border-secondary/10 bg-[#FFE1AF]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/intelligence" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center shadow-sm">
                <Activity className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-secondary tracking-widest uppercase text-sm">Logistics AI</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/restaurants" className="text-xs font-bold text-primary tracking-widest uppercase">Nodes</Link>
              <Link href="/network-map" className="text-xs font-bold text-secondary/60 hover:text-secondary tracking-widest uppercase transition-colors">Topology</Link>
              <Link href="/analytics" className="text-xs font-bold text-secondary/60 hover:text-secondary tracking-widest uppercase transition-colors">Analytics</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/50" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH NODES..." 
                className="bg-white/50 border border-secondary/10 rounded-md py-2 pl-10 pr-4 text-[10px] font-mono text-secondary placeholder:text-secondary/50 focus:border-primary outline-none w-64 transition-all"
              />
            </div>
            <div className="h-10 w-10 bg-white/60 border border-secondary/10 rounded-md flex items-center justify-center text-xs font-mono text-primary font-bold shadow-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Resource Management</span>
            </div>
            <h1 className="text-4xl font-black text-secondary tracking-tighter uppercase italic">Restaurant Gallery</h1>
            <p className="text-secondary/70 text-sm font-mono mt-2 max-w-xl uppercase tracking-wider">
              Select an active node to view operational menu protocols and dispatch requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/restaurants" className="bg-white/60 border border-secondary/10 p-3 rounded-md text-primary hover:bg-primary hover:text-[#FFE1AF] transition-all shadow-sm block">
              <LayoutGrid className="h-5 w-5" />
            </Link>
            <Link href="/network-map" className="bg-[#FFE1AF]/50 border border-secondary/10 p-3 rounded-md text-secondary/60 hover:text-secondary hover:bg-white/60 transition-all shadow-sm block">
              <Map className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <p className="text-secondary/50 font-mono text-xs uppercase tracking-widest">Scanning Network Nodes...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {restaurants
              .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((restaurant, index) => (
              <motion.div
                key={restaurant.restaurant_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RestaurantCard 
                  restaurant={restaurant}
                  fallbackImage={PLACEHOLDER_IMAGE}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
