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
  const displayImage = restaurant ? restaurant.image : image;
  const displayCuisine = restaurant ? restaurant.cuisine : cuisine;
  const displayRating = restaurant ? restaurant.rating : (rating || 0);
  const displayDeliveryTime = restaurant ? restaurant.average_delivery_time : (deliveryTime || 0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackImage) {
      e.currentTarget.src = fallbackImage;
    } else if (displayImage && !displayImage.startsWith('http')) {
       e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900 border border-white/10 rounded-[4px] overflow-hidden shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={displayImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"} 
          alt={displayName}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-60" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-[4px] flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-white">{displayRating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-primary transition-colors">{displayName}</h3>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">{displayCuisine}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 mb-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{displayDeliveryTime} MIN</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Utensils className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase">Premium</span>
          </div>
        </div>

        <Link 
          href={`/restaurants/${displayId}`}
          className="w-full bg-slate-950 hover:bg-primary text-white border border-white/5 hover:border-primary py-3 rounded-[4px] text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn"
        >
          View Menu
          <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>

      {/* Kinetic Accent Line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}
