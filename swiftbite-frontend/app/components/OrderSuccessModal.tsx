"use client";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Hash, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import { OrderResult } from "../types";

interface Props {
  order: OrderResult;
  restaurantName: string;
  onClose: () => void;
}

export default function OrderSuccessModal({ order, restaurantName, onClose }: Props) {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#FFE1AF] rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>

        <h2 className="text-2xl font-black text-[#957C62] mb-2">Order Placed! 🎉</h2>
        <p className="text-[#957C62]/60 text-sm mb-8">
          Your order from <span className="font-bold text-[#B77466]">{restaurantName}</span> is confirmed!
        </p>

        <div className="space-y-3 mb-8 text-left">
          <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#957C62]/70">
              <Hash className="h-3.5 w-3.5" />Order ID
            </div>
            <span className="font-black text-[#B77466] text-sm">#{order.order_id}</span>
          </div>
          <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#957C62]/70">
              <Clock className="h-3.5 w-3.5" />Est. Delivery
            </div>
            <span className="font-black text-[#957C62] text-sm">{order.estimated_time} mins</span>
          </div>
          <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#957C62]/70">
              <MapPin className="h-3.5 w-3.5" />Distance
            </div>
            <span className="font-black text-[#957C62] text-sm">{order.distance} units</span>
          </div>
        </div>

        {order.path?.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold text-[#957C62]/50 uppercase tracking-widest mb-3">A* Route</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {order.path.map((node, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="w-7 h-7 rounded-full bg-[#B77466]/10 text-[#B77466] text-xs font-black flex items-center justify-center border border-[#B77466]/20">
                    {node}
                  </span>
                  {i < order.path.length - 1 && <ChevronRight className="h-3 w-3 text-[#957C62]/30 flex-shrink-0" />}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={() => { router.push("/orders"); onClose(); }}
            className="w-full bg-[#B77466] hover:bg-[#9c6052] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-[#B77466]/25 text-sm">
            Track My Order
          </button>
          <button onClick={onClose}
            className="w-full text-[#957C62]/60 hover:text-[#957C62] font-semibold py-2 text-sm transition-colors">
            Continue Browsing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
