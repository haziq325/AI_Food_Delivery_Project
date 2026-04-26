"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getOrders, updateOrderStatus, deleteOrder } from "@/lib/api";
import { motion } from "framer-motion";
import { Send, Clock, CheckCircle2, Zap, AlertCircle, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Order {
  order_id: number;
  user_name: string;
  restaurant_name: string;
  status: string;
  total_price: string;
  delivery_path: string;
  created_at: string;
  order_items: Array<{ menu_item_name: string, quantity: number }>;
}

export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // Poll every 5s for the demo
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state for immediate feedback
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const STATUS_OPTIONS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <Clock className="h-3 w-3" />;
      case 'Out for Delivery': return <Send className="h-3 w-3" />;
      case 'Delivered': return <CheckCircle2 className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case 'Out for Delivery': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'Delivered': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default: return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary uppercase">Active Dispatch</h1>
          <p className="text-secondary/70 mt-1 font-mono text-sm uppercase tracking-wider">Live Network Trajectories</p>
        </div>
        <div className="flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Sync Active
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-secondary/60 uppercase tracking-widest bg-secondary/5 border-b border-secondary/10 font-bold">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Order Ref</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Trajectory (Path)</th>
                <th className="px-6 py-4 text-center">Protocol</th>
                <th className="px-6 py-4 rounded-tr-xl text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-secondary/50 font-mono text-[10px] uppercase tracking-widest">Polling Network...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-secondary/50">
                      <AlertCircle className="h-8 w-8 opacity-50" />
                      <p className="font-mono text-[10px] uppercase tracking-widest">No Active Orders in Network</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <motion.tr 
                    key={order.order_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-secondary/5 hover:bg-white/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      <div className="flex items-center">
                        <Zap className="h-3 w-3 mr-1.5 opacity-50" />
                        REL-{order.order_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        getStatusColor(order.status)
                      )}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-secondary text-xs">{order.user_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {order.order_items?.map((item, idx) => (
                          <span key={idx} className="text-[10px] text-secondary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit">
                            {item.quantity}x {item.menu_item_name}
                          </span>
                        ))}
                        {(!order.order_items || order.order_items.length === 0) && (
                          <span className="text-[10px] text-secondary/40 italic">No items logged</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-secondary text-xs">{order.restaurant_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 font-mono text-[9px] text-secondary/70">
                        {order.delivery_path ? (
                          order.delivery_path.split(',').map((node, idx, arr) => (
                            <span key={idx} className="flex items-center">
                              <span className="bg-secondary/5 border border-secondary/10 px-1.5 py-0.5 rounded">N{node}</span>
                              {idx < arr.length - 1 && <span className="mx-1 text-secondary/30">→</span>}
                            </span>
                          ))
                        ) : (
                          <span className="text-rose-500 opacity-70">Path Not Generated</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                          className={cn(
                            "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border outline-none cursor-pointer transition-colors",
                            order.status === 'Delivered' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            order.status === 'Cancelled' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                            "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          )}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status} className="text-secondary bg-white">
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(order.order_id)}
                          className="p-1.5 text-red-500/60 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[10px] text-secondary/60">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
