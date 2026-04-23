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

// Mock data for demonstration
const RESTAURANT_DATA: Record<number, any> = {
  1: { name: "Gourmet Grill", cuisine: "American • Burgers", rating: 4.8, deliveryTime: 25 },
  2: { name: "Sushi Zen Garden", cuisine: "Japanese • Sushi", rating: 4.9, deliveryTime: 35 },
  3: { name: "Trattoria Romana", cuisine: "Italian • Pasta", rating: 4.7, deliveryTime: 30 },
  4: { name: "Prime BBQ", cuisine: "Continental • Grill", rating: 4.6, deliveryTime: 45 },
  5: { name: "Biryani House", cuisine: "Indian • Traditional", rating: 4.8, deliveryTime: 40 },
  6: { name: "Slice of Heaven", cuisine: "Italian • Pizza", rating: 4.5, deliveryTime: 20 },
};

const MENU_ITEMS = [
  { id: 101, name: "Signature Wagyu Burger", price: 18.50, description: "Double wagyu patties, aged cheddar, truffle aioli, brioche bun." },
  { id: 102, name: "Truffle Parmesan Fries", price: 7.95, description: "Hand-cut fries tossed in white truffle oil and 24-month parmesan." },
  { id: 103, name: "Spicy Miso Ramen", price: 16.00, description: "Silky tonkotsu broth, spicy miso, chashu pork, 6-minute egg." },
  { id: 104, name: "Burrata & Prosciutto", price: 14.50, description: "Creamy burrata, 18-month di Parma, wild arugula, balsamic glaze." },
  { id: 105, name: "Dragon Roll Special", price: 19.00, description: "Tempura shrimp, eel, avocado, topped with spicy tuna and unagi sauce." },
];

export default function MenuPage() {
  const { id } = useParams();
  const restaurantId = parseInt(id as string);
  const restaurant = RESTAURANT_DATA[restaurantId] || RESTAURANT_DATA[1];

  const [cart, setCart] = useState<Record<number, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success'>('idle');

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
    const item = MENU_ITEMS.find(i => i.id === parseInt(itemId));
    return sum + (item?.price || 0) * qty;
  }, 0);

  const handlePlaceOrder = async () => {
    setOrderStatus('processing');
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          total_price: totalPrice,
          items: cart
        }),
      });

      if (response.ok) {
        setOrderStatus('success');
        setCart({});
      } else {
        alert("Failed to place order. Please check your session.");
        setOrderStatus('idle');
      }
    } catch (error) {
      console.error("Order error:", error);
      setOrderStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/restaurants" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            Back to Grid
          </Link>
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Node ID: {restaurantId}</div>
             <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Restaurant Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="text-lg font-bold text-white">{restaurant.rating}</span>
            <div className="h-1 w-1 bg-slate-700 rounded-full" />
            <Clock className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">{restaurant.deliveryTime} MIN DELIVERY</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2">{restaurant.name}</h1>
          <p className="text-primary font-mono text-xs uppercase tracking-[0.4em] mb-6">{restaurant.cuisine}</p>
          <div className="h-[2px] w-24 bg-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              Operational Protocols <span className="text-[10px] font-mono text-slate-600">(Menu)</span>
            </h2>
            
            {MENU_ITEMS.map((item) => (
              <div key={item.id} className="group bg-slate-900/50 border border-white/5 p-6 rounded-[4px] hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="text-lg font-mono font-bold text-white">${item.price.toFixed(2)}</div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  {cart[item.id] ? (
                    <div className="flex items-center gap-4 bg-slate-950 p-1 rounded-[4px] border border-white/10">
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:text-primary transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-mono font-bold text-sm min-w-[20px] text-center">{cart[item.id]}</span>
                      <button onClick={() => addToCart(item.id)} className="p-1.5 hover:text-primary transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item.id)}
                      className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Add to Dispatch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-slate-900 border border-white/10 rounded-[4px] p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Dispatch Payload
              </h3>
              
              {totalItems === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">Payload Empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(cart).map(([itemId, qty]) => {
                      const item = MENU_ITEMS.find(i => i.id === parseInt(itemId));
                      return (
                        <div key={itemId} className="flex justify-between text-sm">
                          <div className="flex gap-2">
                            <span className="text-primary font-mono font-bold">{qty}x</span>
                            <span className="text-slate-300 truncate max-w-[120px]">{item?.name}</span>
                          </div>
                          <span className="text-white font-mono">${((item?.price || 0) * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Value</span>
                      <span className="text-xl font-mono font-bold text-white">${totalPrice.toFixed(2)}</span>
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
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[4px] p-10 text-center shadow-[0_0_50px_rgba(0,82,255,0.2)]"
            >
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Protocol Success</h2>
              <p className="text-slate-400 text-sm font-mono uppercase tracking-widest leading-relaxed mb-8">
                Your order has been successfully logged in the relational database. Courier dispatch sequence initiated.
              </p>
              <button 
                onClick={() => setOrderStatus('idle')}
                className="w-full bg-slate-950 hover:bg-white/5 border border-white/10 py-4 rounded-[4px] text-[10px] font-bold text-white uppercase tracking-[0.3em] transition-all"
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
