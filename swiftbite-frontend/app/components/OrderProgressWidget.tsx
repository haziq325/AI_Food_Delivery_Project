"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Order {
  order_id: number;
  restaurant_name: string;
  status: string;
}

interface OrderProgressWidgetProps {
  userId: number | undefined;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const STATUS_ORDER = ["Pending", "Preparing", "Out for Delivery", "Delivered"];

export default function OrderProgressWidget({ userId }: OrderProgressWidgetProps) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchActiveOrders = async () => {
      try {
        const res = await fetch(`${API}/api/orders/list/?user_id=${userId}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const active = data.filter(o => 
            o.status !== "Delivered" && o.status !== "Cancelled"
          );
          setActiveOrders(active);
          if (active.length > 0) setDismissed(false);
          // Adjust currentIndex if it's out of bounds after update
          if (currentIndex >= active.length) setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Failed to fetch active orders", err);
      }
    };

    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [userId, currentIndex]);

  const activeOrder = activeOrders[currentIndex];

  if (!activeOrder || dismissed) return null;

  const progressIndex = STATUS_ORDER.indexOf(activeOrder.status);
  const progressPercent = ((progressIndex + 1) / STATUS_ORDER.length) * 100;

  const nextOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeOrders.length);
  };

  const prevOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeOrders.length) % activeOrders.length);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeOrder.order_id}
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-[320px]"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-[#957C62]/10 shadow-2xl rounded-2xl overflow-hidden">
          {activeOrders.length > 1 && (
            <div className="bg-[#B77466]/10 px-3 py-1 flex justify-between items-center border-b border-[#B77466]/10">
              <p className="text-[9px] font-black text-[#B77466] uppercase tracking-tighter">
                Managing {activeOrders.length} Active Orders
              </p>
              <div className="flex gap-1">
                <button onClick={prevOrder} className="p-0.5 hover:bg-[#B77466]/20 rounded transition-colors">
                  <ChevronLeft className="h-3 w-3 text-[#B77466]" />
                </button>
                <span className="text-[9px] font-bold text-[#B77466]">{currentIndex + 1}/{activeOrders.length}</span>
                <button onClick={nextOrder} className="p-0.5 hover:bg-[#B77466]/20 rounded transition-colors">
                  <ChevronRight className="h-3 w-3 text-[#B77466]" />
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 flex items-center justify-between">
            <Link href="/orders" className="flex-1 group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-[#957C62] truncate pr-2">
                  {activeOrder.restaurant_name}
                </p>
                <div className="flex items-center gap-1 text-[#B77466]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {activeOrder.status}
                  </span>
                  <ChevronRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#957C62]/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[#B77466] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 right-0 w-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </motion.div>
              </div>
            </Link>
            <div className="pl-3 ml-3 border-l border-[#957C62]/10">
              <button 
                onClick={() => setDismissed(true)}
                className="p-1.5 text-[#957C62]/40 hover:text-[#957C62] hover:bg-[#957C62]/5 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
