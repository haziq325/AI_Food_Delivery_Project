"use client";

import { motion } from "framer-motion";
import RestaurantCard from "@/components/RestaurantCard";
import { LayoutGrid, Map, Activity, Search } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";

const RESTAURANTS = [
  {
    id: 1,
    name: "Gourmet Grill",
    cuisine: "American • Burgers",
    image: "/static/images/food_burger.png",
    rating: 4.8,
    deliveryTime: 25
  },
  {
    id: 2,
    name: "Sushi Zen Garden",
    cuisine: "Japanese • Sushi",
    image: "/static/images/food_sushi.png", // Missing, will use fallback
    rating: 4.9,
    deliveryTime: 35
  },
  {
    id: 3,
    name: "Trattoria Romana",
    cuisine: "Italian • Pasta",
    image: "/static/images/food_pizza.png",
    rating: 4.7,
    deliveryTime: 30
  },
  {
    id: 4,
    name: "Prime BBQ",
    cuisine: "Continental • Grill",
    image: "/static/images/food_bbq.png",
    rating: 4.6,
    deliveryTime: 45
  },
  {
    id: 5,
    name: "Biryani House",
    cuisine: "Indian • Traditional",
    image: "/static/images/food_biryani.png",
    rating: 4.8,
    deliveryTime: 40
  },
  {
    id: 6,
    name: "Slice of Heaven",
    cuisine: "Italian • Pizza",
    image: "/static/images/food_pizza.png",
    rating: 4.5,
    deliveryTime: 20
  }
];

export default function RestaurantGallery() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary/30">
      {/* Header / Nav */}
      <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center shadow-[0_0_15px_rgba(0,82,255,0.3)]">
                <Activity className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-white tracking-widest uppercase text-sm">Logistics AI</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-xs font-bold text-primary tracking-widest uppercase">Nodes</a>
              <a href="#" className="text-xs font-bold text-slate-500 hover:text-white tracking-widest uppercase transition-colors">Topology</a>
              <a href="#" className="text-xs font-bold text-slate-500 hover:text-white tracking-widest uppercase transition-colors">Analytics</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input 
                type="text" 
                placeholder="SEARCH NODES..." 
                className="bg-slate-900/50 border border-white/5 rounded-[4px] py-2 pl-10 pr-4 text-[10px] font-mono text-white placeholder:text-slate-700 focus:border-primary outline-none w-64 transition-all"
              />
            </div>
            <div className="h-10 w-10 bg-slate-900 border border-white/10 rounded-[4px] flex items-center justify-center text-xs font-mono text-primary font-bold">
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
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Restaurant Gallery</h1>
            <p className="text-slate-500 text-sm font-mono mt-2 max-w-xl uppercase tracking-wider">
              Select an active node to view operational menu protocols and dispatch requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-slate-900 border border-white/10 p-3 rounded-[4px] text-primary hover:bg-primary hover:text-white transition-all">
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button className="bg-slate-950 border border-white/10 p-3 rounded-[4px] text-slate-500 hover:text-white transition-all">
              <Map className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {RESTAURANTS.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RestaurantCard 
                {...restaurant} 
                image={restaurant.image} 
                fallbackImage={PLACEHOLDER_IMAGE}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
