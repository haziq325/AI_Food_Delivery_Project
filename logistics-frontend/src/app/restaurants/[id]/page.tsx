"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  Star, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import Link from "next/link";

import { getRestaurants, getMenuItems, placeOrder } from "@/lib/api";
import { Restaurant, MenuItem } from "@/lib/types";

export default function MenuPage() {
  const { id } = useParams();
  const restaurantId = parseInt(id as string);
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    async function fetchData() {
      try {
        const [allRests, items] = await Promise.all([
          getRestaurants(),
          getMenuItems(restaurantId)
        ]);
        
        const found = allRests.find(r => r.restaurant_id === restaurantId);
        setRestaurant(found || null);
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [restaurantId]);

  const addToCart = (itemId: number) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) newCart[itemId]--;
      else delete newCart[itemId];
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find(i => i.item_id === parseInt(itemId));
    const priceNum = item ? parseFloat(item.price as string) : 0;
    return sum + (isNaN(priceNum) ? 0 : priceNum) * qty;
  }, 0);

  const handlePlaceOrder = async () => {
    setOrderStatus('processing');
    try {
      const response = await placeOrder({
        user_id: 4, // Defaulting to Lead Analyst (ID 4) for demo
        restaurant_id: restaurantId,
      });

      if (response.status === 'success') {
        setOrderStatus('success');
        setCart({});
      } else {
        alert("Failed to place order.");
        setOrderStatus('idle');
      }
    } catch (error) {
      console.error("Order error:", error);
      setOrderStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFE1AF] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FFE1AF] flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold text-secondary mb-4 uppercase italic">Node Not Found</h1>
        <p className="text-secondary/70 mb-8 max-w-md">The requested operational node is not registered in the relational database.</p>
        <Link href="/restaurants" className="bg-primary text-white px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs">Return to Grid</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-secondary">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-[#FFE1AF]/80 backdrop-blur-xl border-b border-secondary/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/restaurants" className="text-secondary/70 hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            Back to Grid
          </Link>
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-mono text-secondary/50 uppercase tracking-widest">Node ID: {restaurantId}</div>
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Restaurant Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="text-lg font-bold text-secondary">{restaurant.rating}</span>
            <div className="h-1 w-1 bg-secondary/30 rounded-full" />
            <Clock className="h-5 w-5 text-secondary/60" />
            <span className="text-sm font-medium text-secondary/60">{restaurant.average_delivery_time} MIN DELIVERY</span>
          </div>
          <h1 className="text-5xl font-black text-secondary tracking-tighter uppercase italic mb-2">{restaurant.name}</h1>
          <p className="text-primary font-mono text-xs uppercase tracking-[0.4em] mb-6">{restaurant.cuisine}</p>
          <div className="h-[2px] w-24 bg-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-bold text-secondary uppercase tracking-widest mb-8 flex items-center gap-3">
              Operational Protocols <span className="text-[10px] font-mono text-secondary/60">(Menu)</span>
            </h2>
            
            {menuItems.length === 0 ? (
               <div className="bg-white/40 border border-secondary/10 p-12 rounded-xl text-center">
                  <p className="text-secondary/50 font-mono text-xs uppercase tracking-widest">No Menu Protocols Found</p>
               </div>
            ) : (
              menuItems.map((item) => (
                <div key={item.item_id} className="group bg-white/60 backdrop-blur-xl border border-secondary/10 p-6 rounded-xl hover:border-primary/40 shadow-sm transition-all hover:shadow-[0_4px_20px_rgba(183,116,102,0.15)]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-sm text-secondary/70 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="text-lg font-mono font-bold text-secondary">${item.price}</div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    {cart[item.item_id] ? (
                      <div className="flex items-center gap-4 bg-white/50 p-1 rounded-md border border-secondary/20 shadow-inner">
                        <button onClick={() => removeFromCart(item.item_id)} className="p-1.5 hover:text-primary transition-colors">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-mono font-bold text-sm min-w-[20px] text-center">{cart[item.item_id]}</span>
                        <button onClick={() => addToCart(item.item_id)} className="p-1.5 hover:text-primary transition-colors">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(item.item_id)}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add to Dispatch
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(183,116,102,0.1)]">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Dispatch Payload
              </h3>
              
              {totalItems === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">Payload Empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-secondary">
                    {Object.entries(cart).map(([itemId, qty]) => {
                      const item = menuItems.find(i => i.item_id === parseInt(itemId));
                      return (
                        <div key={itemId} className="flex justify-between text-sm">
                          <div className="flex gap-2">
                            <span className="text-primary font-mono font-bold">{qty}x</span>
                            <span className="text-secondary truncate max-w-[120px] font-medium">{item?.name}</span>
                          </div>
                          <span className="text-secondary font-mono font-bold">${((item ? parseFloat(item.price) : 0) * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-6 border-t border-secondary/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">Total Value</span>
                      <span className="text-xl font-mono font-bold text-secondary">${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={orderStatus !== 'idle'}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-[4px] font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {orderStatus === 'processing' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : orderStatus === 'success' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Order Dispatched
                        </>
                      ) : (
                        "Initiate Dispatch"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {orderStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[#FFE1AF]/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-white/80 border border-secondary/10 rounded-xl p-10 text-center shadow-[0_10px_50px_rgba(183,116,102,0.2)]"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-secondary uppercase italic tracking-tighter mb-4">Protocol Success</h2>
              <p className="text-secondary/70 text-sm font-mono uppercase tracking-widest leading-relaxed mb-8">
                Your order has been successfully logged in the relational database. Courier dispatch sequence initiated.
              </p>
              <button 
                onClick={() => setOrderStatus('idle')}
                className="w-full bg-white hover:bg-primary border border-secondary/20 hover:border-primary py-4 rounded-md text-[10px] font-bold text-secondary hover:text-white uppercase tracking-[0.3em] transition-all shadow-sm"
              >
                Return to Node Control
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
