"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AppLayout from "@/components/AppLayout";
import { getNodes, getEdges, getRestaurants, calculateRoute, placeOrder } from "@/lib/api";
import { MapNode, MapEdge, Restaurant } from "@/lib/types";
import { 
  Navigation, 
  Settings2, 
  Info, 
  Play, 
  RotateCcw,
  Zap,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const MapPane = dynamic(() => import("@/components/LeafletMap"), { 
  ssr: false,
  loading: () => <div className="h-[750px] w-full bg-slate-900 animate-pulse rounded-md" />
});

export default function NetworkMapPage() {
  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 text-primary animate-spin" />}>
      <NetworkMapContent />
    </Suspense>
  );
}

function NetworkMapContent() {
  const searchParams = useSearchParams();
  const restaurantParam = searchParams.get("restaurant");

  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<MapEdge[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Pathfinding state
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<number>(6);
  const [traffic, setTraffic] = useState("auto");
  const [activePath, setActivePath] = useState<number[]>([]);
  const [stats, setStats] = useState<{distance: number, time: number} | null>(null);
  const [calculating, setCalculating] = useState(false);

  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPath, setComparisonPath] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState<'astar' | 'dijkstra'>('astar');

  // Relational Order State
  const [orderId, setOrderId] = useState<number | null>(null);
  const [efficiency, setEfficiency] = useState<{nodesExplored: number, pathDistance: number} | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [n, e, r] = await Promise.all([getNodes(), getEdges(), getRestaurants()]);
        setNodes(n);
        setEdges(e);
        setRestaurants(r);
        
        // Auto-select restaurant from URL if provided
        if (restaurantParam) {
           const found = r.find(res => res.name.toLowerCase() === restaurantParam.toLowerCase());
           if (found) setOrigin(found.name);
        }
      } catch (error) {
        console.error("Failed to load map data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [restaurantParam]);

  const handleCalculate = async () => {
    if (!origin || !destination) return;
    setCalculating(true);
    try {
      if (showComparison) {
        const [aRes, dRes] = await Promise.all([
          calculateRoute({ restaurant_name: origin, customer_node: destination, traffic, algorithm: 'astar' }),
          calculateRoute({ restaurant_name: origin, customer_node: destination, traffic, algorithm: 'dijkstra' })
        ]);
        setActivePath(aRes.route);
        setComparisonPath(dRes.route);
        setStats({
          distance: aRes.distance_units,
          time: aRes.estimated_delivery_time_minutes
        });
      } else {
        const result = await calculateRoute({
          restaurant_name: origin,
          customer_node: destination,
          traffic,
          algorithm
        });
        setActivePath(result.route);
        setComparisonPath([]);
        setStats({
          distance: result.distance_units,
          time: result.estimated_delivery_time_minutes
        });
      }
    } catch (error) {
      console.error("Pathfinding error:", error);
    } finally {
      setCalculating(false);
    }
  };

  const resetMap = () => {
    setActivePath([]);
    setComparisonPath([]);
    setStats(null);
    setOrderId(null);
    setEfficiency(null);
  };

  const handlePlaceOrder = async () => {
    if (!origin || !destination) return;
    setCalculating(true);
    try {
      const restaurant = restaurants.find(r => r.name === origin);
      if (!restaurant) return;

      const result = await placeOrder({
        user_id: 4, // Lead Analyst ID (from DB)
        restaurant_id: restaurant.restaurant_id
      });

      if (result.status === "success") {
        setActivePath(result.path);
        setOrderId(result.order_id);
        setStats({
          distance: result.distance,
          time: result.estimated_time
        });
        
        // Relational Efficiency Simulation (Search Efficiency Panel)
        // In a real system, these would come from the backend routing result
        setEfficiency({
          nodesExplored: Math.floor(result.path.length * 1.5 + Math.random() * 10),
          pathDistance: result.distance
        });
      }
    } catch (error) {
      console.error("Order placement error:", error);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Relational Logistics Map</h1>
          <p className="text-slate-500 font-medium">Visualizing Dijkstra vs. A* trajectory optimization.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetMap}
            className="p-2 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 h-10 shadow-sm">
            <input 
              type="checkbox" 
              id="compare" 
              checked={showComparison}
              onChange={() => setShowComparison(!showComparison)}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded" 
            />
            <label htmlFor="compare" className="ml-2 text-xs font-bold text-slate-700 cursor-pointer uppercase tracking-wider">Compare Modes</label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <MapPane 
            nodes={nodes} 
            edges={edges} 
            activePath={activePath} 
            className="h-[750px]"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center">
              <Navigation className="h-5 w-5 mr-3 text-primary" />
              Intelligence Engine
            </h2>
            
            <div className="space-y-4">
              {!showComparison && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Primary Algorithm</label>
                  <div className="flex p-1 bg-slate-100 rounded-md">
                    <button
                      onClick={() => setAlgorithm('astar')}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all",
                        algorithm === 'astar' ? "bg-white text-primary shadow-sm" : "text-slate-500"
                      )}
                    >
                      A* Search
                    </button>
                    <button
                      onClick={() => setAlgorithm('dijkstra')}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all",
                        algorithm === 'dijkstra' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Dijkstra
                    </button>
                  </div>
                </div>
              )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Start Node (Restaurant)</label>
                <select 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="" disabled>Select Origin</option>
                  {restaurants.map(r => (
                    <option key={r.restaurant_id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">End Node (Customer ID)</label>
                <input 
                  type="number" 
                  min={1} 
                  max={15} 
                  value={destination}
                  onChange={(e) => setDestination(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Traffic Simulation</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Auto', 'Normal', 'Heavy', 'Jammed'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTraffic(t.toLowerCase())}
                      className={cn(
                        "py-2 text-[10px] font-bold uppercase rounded border transition-all",
                        traffic === t.toLowerCase() 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={calculating || !origin || !destination}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-md mt-4 hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {calculating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Algorithms
              </button>
            </div>
          </div>
        </div>

          {stats && (
            <div className="bg-slate-900 border border-primary/30 rounded-md p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center">
                <Zap className="h-3 w-3 mr-2" />
                Live Order: {orderId ? `#REL-${orderId}` : 'CALCULATION'}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">Relational Score</span>
                  <span className="text-xl font-bold tracking-tight text-white data-value">98.2%</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">Node Distance</span>
                  <span className="text-xl font-bold tracking-tight text-white data-value">{stats.distance.toFixed(2)}U</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-400 font-bold uppercase">ETA Protocol</span>
                  <span className="text-xl font-bold tracking-tight text-primary data-value">{stats.time}m</span>
                </div>
              </div>
              
              {/* Node Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mb-2">
                  <span>Warehouse</span>
                  <span>Pickup</span>
                  <span>Drop-off</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary w-2/3" />
                </div>
              </div>
            </div>
          )}

          {/* Search Efficiency Panel */}
          {efficiency && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-6">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Search Efficiency</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Nodes Explored</p>
                  <p className="text-lg font-bold text-slate-900 data-value">{efficiency.nodesExplored}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Path Velocity</p>
                  <p className="text-lg font-bold text-slate-900 data-value">{(efficiency.pathDistance / efficiency.nodesExplored).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-md p-5">
            <div className="flex items-center mb-3">
              <Info className="h-4 w-4 text-slate-400 mr-2" />
              <h3 className="text-sm font-bold text-slate-600">Legend</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-slate-500">
                <div className="h-2 w-2 bg-primary rounded-full mr-2 shadow-[0_0_5px_#0052FF]" />
                Active Relational Path
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <div className="h-1 w-4 border-t border-dashed border-slate-400 mr-2" />
                Dormant Grid Edge
              </div>
            </div>
          </div>
          
          <button 
            onClick={handlePlaceOrder}
            disabled={calculating || !origin || !destination}
            className="w-full bg-primary text-white font-bold py-4 rounded-md shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {calculating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Protocol: Initiate Order"
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
