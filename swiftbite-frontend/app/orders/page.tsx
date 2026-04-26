"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Hash, Package, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { CartItem, UserSession } from "../types";
import CartDrawer from "../components/CartDrawer";
import LiveMap from "../components/LiveMap";

interface Order {
  order_id: number;
  user_name: string;
  restaurant_name: string;
  total_price: string;
  status: string;
  delivery_path: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  restaurant: number;
  order_items: { order_item_id: number; menu_item: number; menu_item_name: string; quantity: number; price: string }[];
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Preparing: "bg-blue-50 text-blue-700 border-blue-200",
  "Out for Delivery": "bg-purple-50 text-purple-700 border-purple-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

function getUser(): UserSession | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((c) => c.startsWith("swiftbite_user="));
  if (!raw) return null;
  try { return JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("="))); }
  catch { return null; }
}

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    const saved = localStorage.getItem("swiftbite_cart");
    if (saved) try { setCart(JSON.parse(saved)); } catch { /* ignore */ }
  }, [router]);

  useEffect(() => {
    localStorage.setItem("swiftbite_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/api/orders/list/?user_id=${user.user_id}`)
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleRate = async (orderId: number, rating: number, review?: string) => {
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/rate/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, rating, review: review || o.review } : o));
      }
    } catch (err) {
      console.error("Rate failed", err);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: "Cancelled" } : o));
      }
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const handleReorder = (order: Order) => {
    // Construct new cart items
    const newItems: CartItem[] = order.order_items.map(oi => ({
      item_id: oi.menu_item,
      name: oi.menu_item_name,
      price: Number(oi.price),
      quantity: oi.quantity,
      restaurant_id: order.restaurant,
      restaurant_name: order.restaurant_name
    }));

    setCart(newItems);
    setCartOpen(true);
    // Optionally alert the user
    // alert("Items added to cart!");
  };

  const logout = useCallback(async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
  }, [router]);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen food-grain-bg">
      <Navbar user={user} cartCount={cartCount} onCartClick={() => setCartOpen(true)} onLogout={logout} onLocationUpdate={setUser} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/home" className="inline-flex items-center gap-1.5 text-xs text-[#957C62]/60 hover:text-[#B77466] font-semibold transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Restaurants
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#B77466] rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#957C62]">My Orders</h1>
              <p className="text-xs text-[#957C62]/50">Track your past and current orders</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-[#957C62]/10 rounded w-1/3 mb-3" />
                <div className="h-3 bg-[#957C62]/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-[#957C62]/60 font-medium">No orders yet.</p>
            <Link href="/home" className="text-[#B77466] text-sm font-bold hover:underline mt-2 inline-block">
              Start ordering →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order.order_id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-6 border border-[#957C62]/8">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-3.5 w-3.5 text-[#957C62]/40" />
                      <span className="font-black text-[#957C62] text-sm">Order #{order.order_id}</span>
                    </div>
                    <p className="font-bold text-[#B77466] text-sm">{order.restaurant_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === "Pending" && (
                      <button 
                        onClick={() => handleCancel(order.order_id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_STYLES[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {order.status}
                    </span>
                    <button 
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 bg-[#B77466] text-white px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:bg-[#9c6052] transition-colors"
                    >
                      <Star className="h-3 w-3 fill-white" />
                      Reorder
                    </button>
                  </div>
                </div>

                {/* Items */}
                {order.order_items?.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {order.order_items.map((oi) => (
                      <p key={oi.order_item_id} className="text-xs text-[#957C62]/70">
                        {oi.quantity}× {oi.menu_item_name}
                      </p>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#957C62]/10">
                  <div className="flex items-center gap-1 text-xs text-[#957C62]/50">
                    <Clock className="h-3 w-3" />
                    {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
                  </div>
                  <span className="font-black text-[#957C62] text-sm">Rs. {Number(order.total_price).toLocaleString()}</span>
                </div>

                {/* Intelligence & Tracking Section */}
                {(order.delivery_path || order.status === "Delivered") && (
                  <div className="mt-4 pt-4 border-t border-[#957C62]/10">
                    {order.delivery_path && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-[10px] font-bold text-[#957C62]/40 uppercase tracking-widest">A* Path Intelligence</p>
                            <p className="text-[9px] text-[#957C62]/30 font-mono">Real-time network trajectory visualization</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-[#B77466]/5 px-2 py-1 rounded-lg border border-[#B77466]/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#B77466] animate-pulse" />
                            <span className="text-[9px] font-black text-[#B77466] uppercase">Live Tracking</span>
                          </div>
                        </div>
                        
                        <LiveMap path={order.delivery_path} status={order.status} />

                        <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                          {order.delivery_path.split(",").map((node, ni) => (
                            <span key={ni} className="flex items-center gap-0.5">
                              <span className="w-5 h-5 rounded-md bg-[#957C62]/5 text-[#957C62]/60 text-[9px] font-black flex items-center justify-center border border-[#957C62]/10">
                                {node.trim()}
                              </span>
                              {ni < (order.delivery_path?.split(",").length || 0) - 1 && (
                                <span className="text-[#957C62]/20 text-[10px]">→</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Rating Section - Now always available for Delivered orders */}
                    {order.status === "Delivered" && (
                      <div className={`${order.delivery_path ? "mt-6 pt-6 border-t border-[#957C62]/10" : ""}`}>
                        <p className="text-[10px] font-bold text-[#957C62]/40 uppercase tracking-widest mb-3">Rate your experience</p>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRate(order.order_id, star)}
                                className="transition-transform active:scale-90"
                              >
                                <Star 
                                  className={`h-5 w-5 ${order.rating && star <= order.rating ? "fill-amber-400 text-amber-400" : "text-[#957C62]/20"}`} 
                                />
                              </button>
                            ))}
                            {order.rating && (
                              <span className="text-xs font-bold text-amber-600 ml-2">
                                {order.rating === 5 ? "Exceptional!" : order.rating >= 4 ? "Great!" : "Thanks for feedback"}
                              </span>
                            )}
                          </div>
                          
                          {/* Review Input */}
                          {!order.review && order.rating && (
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/50 border border-[#957C62]/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#B77466]/30 transition-colors"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRate(order.order_id, order.rating!, e.currentTarget.value);
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                          )}
                          {order.review && (
                            <p className="text-xs text-[#957C62]/60 italic bg-[#957C62]/5 p-2 rounded-lg border border-[#957C62]/5">
                              "{order.review}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} setCart={setCart} user={user} cartTotal={cartTotal} />
    </div>
  );
}
