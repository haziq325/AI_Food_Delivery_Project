"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getOrders, updateOrderStatus, deleteOrder, getRiders, assignRider } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, CheckCircle2, Zap, AlertCircle, Trash2, Bike, User } from "lucide-react";
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
  rider_details?: { name: string };
}

export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<Record<number, number>>({});

  const fetchData = async () => {
    try {
      const [ordersData, ridersData] = await Promise.all([getOrders(), getRiders()]);
      setOrders(ordersData);
      setRiders(ridersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchData(); // Refresh everything immediately
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleAssignRider = async (orderId: number) => {
    const riderId = selectedRider[orderId];
    if (!riderId) return;
    try {
      await assignRider(orderId, riderId);
      fetchData();
    } catch (error) {
      console.error("Error assigning rider:", error);
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Already deleted, just remove from UI
        setOrders(prev => prev.filter(o => o.order_id !== orderId));
      } else {
        console.error("Error deleting order:", error);
      }
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
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Assign Rider</th>
                <th className="px-6 py-4 text-center">Protocol</th>
                <th className="px-6 py-4 rounded-tr-xl text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-secondary/50 font-mono text-[10px] uppercase tracking-widest">Polling Network...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-secondary/50">
                      <AlertCircle className="h-8 w-8 opacity-50" />
                      <p className="font-mono text-[10px] uppercase tracking-widest">No Active Orders in Network</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {orders.map((order, i) => (
                    <motion.tr 
                      key={order.order_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
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
                        <p className="font-bold text-secondary text-xs">{order.restaurant_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        {order.rider_details ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-secondary/70 font-bold uppercase tracking-tight">
                            <Bike className="h-3 w-3" />
                            {order.rider_details.name}
                          </div>
                        ) : (order.status === 'Preparing' || order.status === 'Pending') ? (
                          <div className="flex items-center gap-2">
                            <select 
                              className="text-[10px] bg-secondary/5 border border-secondary/10 rounded px-2 py-1 outline-none focus:border-secondary/30"
                              value={selectedRider[order.order_id] || ""}
                              onChange={(e) => setSelectedRider({...selectedRider, [order.order_id]: parseInt(e.target.value)})}
                            >
                              <option value="">Select Rider</option>
                              {riders.filter(r => r.status === 'Available').map(r => (
                                <option key={r.rider_id} value={r.rider_id}>{r.name} ({r.location_name})</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleAssignRider(order.order_id)}
                              disabled={!selectedRider[order.order_id]}
                              className="bg-secondary text-white text-[10px] px-2 py-1 rounded hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                            >
                              Assign
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-secondary/30 italic">No rider assigned</span>
                        )}
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
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[10px] text-secondary/60">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rider Status Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Bike className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-secondary uppercase text-sm">Rider Fleet</h3>
              <p className="text-[10px] text-secondary/50 font-mono">Live Availability Status</p>
            </div>
          </div>
          <div className="space-y-4">
            {riders.map(rider => (
              <div key={rider.rider_id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/5 border border-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-secondary/10">
                    <User className="h-4 w-4 text-secondary/60" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary">{rider.name}</p>
                    <p className="text-[9px] text-secondary/40 font-mono uppercase">{rider.location_name || 'Idle'}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  rider.status === 'Available' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                  {rider.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
