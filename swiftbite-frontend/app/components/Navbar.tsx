import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, Package, LogOut, MapPin, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import OrderProgressWidget from "./OrderProgressWidget";

interface User {
  user_id: number;
  name: string;
  location_node_id: number | null;
  location_name: string;
}

interface NavbarProps {
  user: User | null;
  cartCount: number;
  onCartClick: () => void;
  onLogout: () => void;
  onLocationUpdate?: (newUser: User) => void;
}

export default function Navbar({ user, cartCount, onCartClick, onLogout, onLocationUpdate }: NavbarProps) {
  const [nodes, setNodes] = useState<{ node_id: number; name: string }[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/nodes/`)
      .then((res) => res.json())
      .then((data) => setNodes(data))
      .catch((err) => console.error("Failed to load nodes", err));
  }, []);

  const handleLocationChange = async (nodeId: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/auth/update-location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, location_node_id: parseInt(nodeId) }),
      });
      const data = await res.json();
      if (res.ok && onLocationUpdate) {
        onLocationUpdate(data.user);
      }
    } catch (err) {
      console.error("Failed to update location", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FFE1AF]/90 backdrop-blur-md border-b border-[#957C62]/12 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#B77466] rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black text-[#957C62] tracking-tight">
            Swift<span className="text-[#B77466]">Bite</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <div className="relative group hidden sm:block">
              <div className="flex items-center gap-1.5 text-xs text-[#957C62]/70 bg-[#957C62]/8 px-3 py-1.5 rounded-full hover:bg-[#957C62]/12 transition-all cursor-pointer border border-transparent hover:border-[#957C62]/10">
                {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                <span className="font-semibold">{user.location_name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
              <select
                value={user.location_node_id || ""}
                onChange={(e) => handleLocationChange(e.target.value)}
                disabled={updating}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {nodes.map((node) => (
                  <option key={node.node_id} value={node.node_id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Link href="/orders">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#957C62] hover:text-[#B77466] transition-colors px-3 py-2 rounded-xl hover:bg-[#B77466]/8">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Orders</span>
            </motion.div>
          </Link>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onCartClick}
            className="relative flex items-center gap-2 bg-[#B77466] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#9c6052] transition-colors">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <motion.span key={cartCount} initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-[#957C62] rounded-full text-[10px] font-black text-white flex items-center justify-center">
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          {user && (
            <div className="flex items-center gap-1">
              <span className="hidden md:block text-xs font-bold text-[#957C62] max-w-[100px] truncate">{user.name}</span>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onLogout} title="Logout"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#957C62]/50 hover:text-red-400 hover:bg-red-50 transition-all">
                <LogOut className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
      </nav>
      
      <OrderProgressWidget userId={user?.user_id} />
    </>
  );
}
