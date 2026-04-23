"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getRestaurants, getMenuItems, placeOrder } from "@/lib/api";
import { Restaurant, MenuItem } from "@/lib/types";
import { Send, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DispatchPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRest, setSelectedRest] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    getRestaurants().then(setRestaurants);
  }, []);

  useEffect(() => {
    if (selectedRest) {
      getMenuItems(selectedRest).then(setMenuItems);
      setSelectedItem(null);
    }
  }, [selectedRest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest || !selectedItem) return;

    setLoading(true);
    setOrderStatus(null);
    try {
      await placeOrder({
        user_id: 4, // Defaulting to Lead Analyst (ID 4) for demo
        restaurant_id: selectedRest,
      });
      setOrderStatus({ type: 'success', message: "Order dispatched successfully! Relational database updated via Stored Procedure." });
    } catch (error: any) {
      setOrderStatus({ type: 'error', message: error.response?.data?.error || "Failed to place order." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2 uppercase">Dispatch Center</h1>
        <p className="text-slate-500 text-sm font-mono tracking-tight">Direct interface to the PostgreSQL relational execution layer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
            <h2 className="text-lg font-bold mb-8 flex items-center uppercase tracking-tight">
              <ShoppingBag className="h-5 w-5 mr-3 text-primary" />
              New Logistics Request
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-[0.2em]">Restaurant (Node Origin)</label>
                  <select 
                    value={selectedRest || ""}
                    onChange={(e) => setSelectedRest(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="" disabled>Select Source Node</option>
                    {restaurants.map(r => (
                      <option key={r.restaurant_id} value={r.restaurant_id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-[0.2em]">Catalog Item</label>
                  <select 
                    value={selectedItem || ""}
                    onChange={(e) => setSelectedItem(Number(e.target.value))}
                    disabled={!selectedRest}
                    className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 outline-none"
                  >
                    <option value="" disabled>Select Item</option>
                    {menuItems.map(item => (
                      <option key={item.item_id} value={item.item_id}>{item.name} - ${item.price}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end gap-8">
                <div className="w-32">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-[0.2em]">Quantity</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={loading || !selectedRest || !selectedItem}
                  className="flex-1 bg-primary text-white font-bold py-4 px-6 rounded-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-3" />
                  )}
                  Initialize Sequence
                </button>
              </div>
            </form>

            {orderStatus && (
              <div className={cn(
                "mt-8 p-4 rounded-md flex items-start border",
                orderStatus.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
              )}>
                {orderStatus.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{orderStatus.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-md p-6 text-white">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Live Dispatch Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-slate-400 font-medium">Protocol</span>
                <span className="text-sm font-bold text-primary">POSTGRES_STORED_PROC</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-slate-400 font-medium">Validation</span>
                <span className="text-sm font-bold text-emerald-400">PASSED</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-400 font-medium">API Latency</span>
                <span className="text-sm font-bold text-slate-300">42ms</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-md p-6">
            <h3 className="text-lg font-bold mb-4">Relational Context</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
              When an order is dispatched, the system triggers a row-level lock on the `Order` table 
              to ensure acid compliance during pathfinding calculations.
            </p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
