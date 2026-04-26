"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import MetricCard from "@/components/MetricCard";
import RestaurantCard from "@/components/RestaurantCard";
import { getRestaurants, getRecommendations } from "@/lib/api";
import { Restaurant } from "@/lib/types";
import { 
  Zap, 
  Target, 
  AlertTriangle, 
  ChevronRight, 
  Loader2,
  Users
} from "lucide-react";

export default function IntelligencePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(4); // Default to Test User (ID 4)

  useEffect(() => {
    async function fetchData() {
      try {
        const [allRests, recs] = await Promise.all([
          getRestaurants(),
          getRecommendations(selectedUser)
        ]);
        setRestaurants(allRests);
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to fetch intelligence data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedUser]);

  return (
    <AppLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight mb-2 uppercase">Relational Intelligence</h1>
          <p className="text-secondary/70 text-sm font-mono tracking-tight">High-performance culinary matches optimized for peak velocity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          title="Network Efficiency" 
          value="94.2%" 
          change="2.4%" 
          isPositive={true} 
          icon={Zap} 
        />
        <MetricCard 
          title="Avg. Path Latency" 
          value="12.8ms" 
          change="0.5ms" 
          isPositive={false} 
          icon={Target} 
        />
        <MetricCard 
          title="Relational Bottlenecks" 
          value="3 Nodes" 
          icon={AlertTriangle} 
          className="border-rose-100 bg-rose-50/10"
        />
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
            Personalized Network Node Suggestions
          </h2>
          <Link href="/network-map" className="text-primary text-sm font-bold flex items-center hover:underline">
            View All Nodes <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 text-secondary/70 font-medium">Optimizing Graph...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rest) => (
              <RestaurantCard key={rest.restaurant_id} restaurant={rest} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-xl p-8 text-secondary border border-secondary/10 shadow-[0_8px_32px_0_rgba(183,116,102,0.1)] relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-primary">Node Relationship Analysis</h2>
          <p className="text-secondary/80 max-w-2xl mb-6">
            Our graph-based topology engine analyzes the Dijkstra pathfinding history against A* performance 
            to identify high-traffic vectors in the city grid.
          </p>
          <div className="flex gap-4">
            <div className="bg-secondary/5 px-4 py-2 rounded-md text-sm font-bold border border-secondary/10 text-secondary">
              Total Nodes: 15
            </div>
            <div className="bg-secondary/5 px-4 py-2 rounded-md text-sm font-bold border border-secondary/10 text-secondary">
              Active Edges: 24
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-gradient-to-l from-primary to-transparent" />
      </div>
    </AppLayout>
  );
}
