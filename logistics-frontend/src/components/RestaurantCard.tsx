"use client";

import { motion } from "framer-motion";
import { Utensils, Star, Clock, ChevronRight } from "lucide-react";
import { Restaurant } from "@/lib/types";
import Link from "next/link";

interface RestaurantCardProps {
  id?: number;
  name?: string;
  image?: string;
  cuisine?: string;
  rating?: number;
  deliveryTime?: number;
  fallbackImage?: string;
  restaurant?: Restaurant; // Support old prop style
}

export default function RestaurantCard({ 
  id,
  name, 
  image, 
  cuisine, 
  rating, 
  deliveryTime, 
  fallbackImage,
  restaurant 
}: RestaurantCardProps) {
  // Use restaurant prop if provided, otherwise use flat props
  const displayId = restaurant ? restaurant.restaurant_id : id;
  const displayName = restaurant ? restaurant.name : name;
  const displayCuisine = restaurant ? restaurant.cuisine : cuisine;
  const displayRating = restaurant ? restaurant.rating : (rating || 0);
  const displayDeliveryTime = restaurant ? restaurant.average_delivery_time : (deliveryTime || 0);

  // Dynamic Cuisine Image Mapper
  const getCuisineImage = (cuisineName: string) => {
    const c = (cuisineName || "").toLowerCase();
    if (c.includes("burger") || c.includes("fast food")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop";
    if (c.includes("pizza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop";
    if (c.includes("bbq") || c.includes("grill")) return "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000&auto=format&fit=crop";
    if (c.includes("cafe") || c.includes("coffee")) return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop";
    if (c.includes("pakistani") || c.includes("desi") || c.includes("indian")) return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop";
    if (c.includes("chinese") || c.includes("asian")) return "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000&auto=format&fit=crop";
    if (c.includes("dessert") || c.includes("ice cream")) return "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?q=80&w=1000&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"; // Premium fallback
  };

  const displayImage = (restaurant && (restaurant as any).image) || image || getCuisineImage(displayCuisine || "");

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackImage) {
      e.currentTarget.src = fallbackImage;
    } else {
       e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop";
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(183,116,102,0.1)] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_15px_40px_0_rgba(183,116,102,0.2)]"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={displayImage} 
          alt={displayName}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFE1AF]/90 to-transparent opacity-90" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md border border-secondary/20 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
          <Star className="h-3 w-3 text-primary fill-primary" />
          <span className="text-[11px] font-bold text-secondary tracking-widest">{displayRating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-secondary tracking-tight leading-tight group-hover:text-primary transition-colors">{displayName}</h3>
            <p className="text-xs text-primary font-mono uppercase tracking-widest mt-1.5 font-semibold">{displayCuisine}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-5 mb-6">
          <div className="flex items-center gap-1.5 text-secondary/80 bg-secondary/5 px-2 py-1 rounded border border-secondary/10">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold tracking-widest">{displayDeliveryTime} MIN</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary/80 bg-secondary/5 px-2 py-1 rounded border border-secondary/10">
            <Utensils className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Premium</span>
          </div>
        </div>

        <Link 
          href={`/restaurants/${displayId}`}
          className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-[#FFE1AF] border border-primary/30 hover:border-primary py-3 rounded-md text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn hover:shadow-[0_4px_15px_rgba(183,116,102,0.3)]"
        >
          View Menu
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1.5" />
        </Link>
      </div>

      {/* Kinetic Accent Line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-700 ease-out group-hover:w-full" />
    </motion.div>
  );
}
