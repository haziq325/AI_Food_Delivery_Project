"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, Zap } from "lucide-react";
import OrderSuccessModal from "./OrderSuccessModal";

import { CartItem, UserSession, OrderResult } from "../types";
export type { CartItem, UserSession, OrderResult };

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: UserSession | null;
  cartTotal: number;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CartDrawer({ open, onClose, cart, setCart, user, cartTotal }: CartDrawerProps) {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const updateQty = (item_id: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.item_id === item_id ? { ...c, quantity: c.quantity + delta } : c)
          .filter((c) => c.quantity > 0)
    );
  };

  const placeOrder = async () => {
    if (!user) { setError("Not logged in."); return; }
    if (cart.length === 0) { setError("Cart is empty."); return; }
    if (!user.location_node_id) { setError("Your account has no delivery location. Contact admin."); return; }

    setPlacing(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/orders/placement/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          restaurant_id: cart[0].restaurant_id,
          destination_node: user.location_node_id,
          items: cart.map(i => ({ item_id: i.item_id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to place order."); return; }
      setOrderResult(data);
      setCart([]);
      localStorage.removeItem("swiftbite_cart");
    } catch {
      setError("Network error. Is Django running on port 8000?");
    } finally {
      setPlacing(false);
    }
  };

  const restaurantName = cart.length > 0 ? cart[0].restaurant_name : "";

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#FFE1AF] z-50 flex flex-col shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#957C62]/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#B77466] rounded-xl flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#957C62] text-lg">Your Cart</h2>
                    {restaurantName && <p className="text-xs text-[#957C62]/60">from {restaurantName}</p>}
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#957C62]/10 transition-colors">
                  <X className="h-5 w-5 text-[#957C62]" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-[#957C62]/60 font-medium">Your cart is empty.</p>
                    <p className="text-xs text-[#957C62]/40 mt-1">Add items from any restaurant.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div key={item.item_id} layout
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#957C62] truncate">{item.name}</p>
                          <p className="text-xs text-[#957C62]/60 mt-0.5">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => updateQty(item.item_id, -1)}
                            className="w-7 h-7 rounded-full border border-[#957C62]/20 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all text-[#957C62]">
                            {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3" />}
                          </button>
                          <span className="font-black text-[#957C62] w-4 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQty(item.item_id, 1)}
                            className="w-7 h-7 rounded-full bg-[#B77466] text-white flex items-center justify-center hover:bg-[#9c6052] transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-[#957C62]/15 space-y-4">
                  {user?.location_name && (
                    <div className="flex items-center justify-between text-xs text-[#957C62]/70 bg-[#957C62]/8 px-4 py-3 rounded-xl">
                      <span>📍 Delivering to</span>
                      <span className="font-bold text-[#957C62]">{user.location_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#957C62]">Total</span>
                    <span className="text-xl font-black text-[#B77466]">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
                  )}
                  <motion.button whileHover={{ scale: placing ? 1 : 1.01 }} whileTap={{ scale: placing ? 1 : 0.99 }}
                    onClick={placeOrder} disabled={placing}
                    className="w-full bg-[#B77466] hover:bg-[#9c6052] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#B77466]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {placing ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Routing via A*...</>
                    ) : (
                      <><Zap className="h-4 w-4" />Place Order — Rs. {cartTotal.toLocaleString()}</>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderResult && (
          <OrderSuccessModal order={orderResult} restaurantName={restaurantName}
            onClose={() => { setOrderResult(null); onClose(); }} />
        )}
      </AnimatePresence>
    </>
  );
}
