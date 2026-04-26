"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Search, ChevronRight, Sparkles, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { CartItem, UserSession } from "../types";
import CartDrawer from "../components/CartDrawer";

interface MenuItem {
  item_id: number;
  name: string;
  price: number;
}

interface Restaurant {
  restaurant_id: number;
  name: string;
  cuisine: string;
  rating: number;
  average_delivery_time: number;
  menu_items: MenuItem[];
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const CUISINES = ["All", "Fast Food", "Pakistani", "BBQ", "Pizza", "Chinese", "Pan-Asian", "Cafe", "Fine Dining", "Healthy", "American"];

const CUISINE_EMOJIS: Record<string, string> = {
  "All": "🍽️", "Fast Food": "🍔", "Pakistani": "🍛", "BBQ": "🔥",
  "Pizza": "🍕", "Chinese": "🥡", "Pan-Asian": "🍜", "Cafe": "☕",
  "Fine Dining": "✨", "Healthy": "🥗", "American": "🦅",
};

const CUISINE_IMAGES: Record<string, string> = {
  "All": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  "Fast Food": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
  "Pakistani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  "BBQ": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Chinese": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  "Pan-Asian": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
  "Cafe": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
  "Fine Dining": "https://images.unsplash.com/photo-1414235077428-338988692286?auto=format&fit=crop&w=800&q=80",
  "Healthy": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  "American": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
};

const RESTAURANT_IMAGES: Record<string, string> = {
  "Burger O'Clock": "https://oocmjiuymmvwvyvwlfpd.supabase.co/storage/v1/object/public/Project/download.jpg",
  "Student Biryani": "https://images.deliveryhero.io/image/fd-pk/LH/blss-hero.jpg",
  "Kolachi": "https://1.bp.blogspot.com/-QOlc8ut9UU4/YJFlhy4PUtI/AAAAAAAAAB0/N1MZJmImGj420hMU5-6B_GmXTJLEkQQswCLcBGAsYHQ/w1200-h630-p-k-no-nu/Capture.PNG",
  "Xander's": "https://3.bp.blogspot.com/-CaAZYTbkTLA/Wk9GKvb729I/AAAAAAAAGgo/2UIddD5k6L0-qqYsTr6fmszpXDUKbgkLgCEwYBhgL/s1600/Xanders_restuarant_2.jpg",
  "BBQ Tonight": "https://d1w7312wesee68.cloudfront.net/RkcbmCvItraTKeh_Y6SBLlRG2r1oZb_EKjFRzISZAlA/ext:webp/quality:85/c:1000:1000:ce:0:0/plain/s3:/toast-sites-resources-prod/restaurantImages/5ecc7555-98c9-4a47-9fe9-7bdf36367176/finalnewlogotransparent.png",
  "Ginsoy": "https://travel.hamariweb.com/PlacesGallery/thw_898_474.jpg",
  "Chop Chop Wok": "https://res.cloudinary.com/foodoplanet/image/upload/v1564317641/Chop-Chop-Wok-Karachi_lwuqi5.jpg",
  "California Pizza": "https://images.deliveryhero.io/image/fd-pk/LH/s1id-hero.jpg",
  "14th Street Pizza": "https://4.bp.blogspot.com/-En-WSc78dHE/T2jM0XuPGNI/AAAAAAAAADs/_45ZIZyKLu4/s640/14th-Street-Pizza-in-karachi.jpg",
  "Kaybees": "https://www.kaybees.com.pk/_next/image?url=https:%2F%2Fassets.indolj.io%2Fimages%2F1695220718-wdfg.jpeg&w=1080&q=75",
  "OPTP": "https://images.deliveryhero.io/image/fd-pk/LH/w2ae-hero.jpg",
  "Zameer Ansari": "https://oocmjiuymmvwvyvwlfpd.supabase.co/storage/v1/object/public/Project/download%20(1).jpg",
  "Javed Nihari": "https://img.restaurantguru.com/c334-Restaurant-Javed-Nihari-food.jpg",
  "Waheed Kabab House": "https://d2liqplnt17rh6.cloudfront.net/coverImages/Cover8_5680af10-1027-4129-b9fb-7a7b09af43f7-58.jpeg",
  "Cafe Aylanto": "https://www.karachisnob.com/aylanto-22021-iftar-page.jpg",
  "Espresso": "https://images.deliveryhero.io/image/fd-pk/LH/va7p-hero.jpg?width=4000&height=1000&quality=45",
  "KFC": "https://images.deliveryhero.io/image/fd-pk/LH/ootz-hero.jpg",
  "McDonald's": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
  "Hardee's": "https://travel.hamariweb.com/PlacesGallery/161_634547543216600000_660_563756.jpg",
  "Biryani Centre": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  "White Biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  "Domino's Pizza": "https://www.foodies.pk/wp-content/uploads/2019/04/Delicious-Pepperoni-Cheesy-Pizza-1024x683.jpg",
  "Subway": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  "Meerath Kabab House": "https://oocmjiuymmvwvyvwlfpd.supabase.co/storage/v1/object/public/Project/download%20(2).jpg",
  "Roasters": "https://www.citysearch.pk/UF/Companies/9480/roasters-cafe-grill.jpg",
};

function getUser(): UserSession | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((c) => c.startsWith("swiftbite_user="));
  if (!raw) return null;
  try { return JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("="))); }
  catch { return null; }
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);

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
    fetch(`${API}/api/restaurants/`)
      .then((r) => r.json())
      .then((data) => { setRestaurants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/api/recommendations/${user.user_id}/`)
      .then((r) => r.json())
      .then((data) => { if (data.recommendations) setRecommendations(data.recommendations); })
      .catch(() => { /* recommendations are optional */ });
  }, [user]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
  }, [router]);

  const toggleFavorite = async (restaurant_id: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/api/users/${user.user_id}/favorites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const currentIds = user.favorite_ids || [];
        const newIds = data.action === "added" 
          ? [...currentIds, restaurant_id]
          : currentIds.filter(id => id !== restaurant_id);
          
        const newUser = { ...user, favorite_ids: newIds };
        setUser(newUser);
        // Update cookie
        document.cookie = `swiftbite_user=${encodeURIComponent(JSON.stringify(newUser))}; path=/`;
      }
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  const filtered = restaurants.filter((r) => {
    const matchCuisine = cuisine === "All" || r.cuisine === cuisine;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase());
    return matchCuisine && matchSearch;
  }).sort((a, b) => {
    // Favorites first
    const aFav = (user?.favorite_ids || []).includes(a.restaurant_id) ? 1 : 0;
    const bFav = (user?.favorite_ids || []).includes(b.restaurant_id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    // Then by rating
    return b.rating - a.rating;
  });

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen food-grain-bg">
      <Navbar user={user} cartCount={cartCount} onCartClick={() => setCartOpen(true)} onLogout={logout} onLocationUpdate={setUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#957C62] mb-2">
            What are you craving, <span className="text-[#B77466]">{user.name.split(" ")[0]}</span>?
          </h1>
          <p className="text-[#957C62]/60 text-sm">Order from {restaurants.length} restaurants near you</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#957C62]/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants or cuisines..."
            className="w-full glass-card rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[#957C62] placeholder:text-[#957C62]/35 focus:outline-none focus:border-[#B77466] transition-all" />
        </motion.div>

        {/* Cuisine pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CUISINES.map((c) => (
            <button key={c} onClick={() => setCuisine(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${cuisine === c
                  ? "bg-[#B77466] text-white shadow-md shadow-[#B77466]/25"
                  : "bg-white/50 text-[#957C62] hover:bg-white/80 border border-[#957C62]/10"
                }`}>
              {CUISINE_EMOJIS[c] || "🍽️"} {c}
            </button>
          ))}
        </motion.div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && cuisine === "All" && !search && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#B77466]" />
              <h2 className="text-lg font-black text-[#957C62]">Recommended for You</h2>
              <span className="text-[10px] bg-[#B77466]/10 text-[#B77466] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Powered</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {recommendations.slice(0, 6).map((r, i) => (
                <Link key={r.restaurant_id} href={`/restaurant/${r.restaurant_id}`}>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                    className="glass-card rounded-2xl overflow-hidden min-w-[200px] max-w-[200px] cursor-pointer hover:shadow-lg transition-shadow border border-[#B77466]/10 flex flex-col">
                    <div className="h-24 w-full bg-[#957C62]/10 relative overflow-hidden group">
                      <img src={RESTAURANT_IMAGES[r.name] || CUISINE_IMAGES[r.cuisine] || CUISINE_IMAGES["All"]} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm">
                        <Star className="h-2.5 w-2.5 text-[#B77466] fill-[#B77466]" />
                        <span className="text-[10px] font-black text-[#957C62]">{r.rating}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg leading-none">{CUISINE_EMOJIS[r.cuisine] || "🍽️"}</span>
                        <p className="font-bold text-sm text-[#957C62] truncate">{r.name}</p>
                      </div>
                      <p className="text-[10px] text-[#957C62]/50">{r.cuisine} · {r.average_delivery_time} min</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Restaurant grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-[#957C62]/10 rounded w-2/3 mb-4" />
                <div className="h-3 bg-[#957C62]/10 rounded w-1/3 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 bg-[#957C62]/10 rounded w-full" />
                  <div className="h-3 bg-[#957C62]/10 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-[#957C62]/50 mb-4 font-semibold">
              {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.div key={r.restaurant_id} layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="group relative bg-[#FFE1AF] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#957C62]/10">
                    
                    {/* Heart Button */}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(r.restaurant_id); }}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all border border-white/30"
                    >
                      <Heart className={`h-5 w-5 transition-colors ${(user?.favorite_ids || []).includes(r.restaurant_id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>

                    <Link href={`/restaurant/${r.restaurant_id}`} className="block">
                      <div className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-[#B77466]/8 transition-all group border border-transparent hover:border-[#B77466]/15 flex flex-col h-full">
                        {/* Image Header */}
                        <div className="relative h-40 w-full bg-[#957C62]/10 overflow-hidden">
                          <img src={RESTAURANT_IMAGES[r.name] || CUISINE_IMAGES[r.cuisine] || CUISINE_IMAGES["All"]} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Star className="h-3.5 w-3.5 text-[#B77466] fill-[#B77466]" />
                            <span className="text-xs font-black text-[#957C62]">{r.rating}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-black text-[#957C62] text-base group-hover:text-[#B77466] transition-colors">{r.name}</h3>
                              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-[#957C62]/50 bg-[#957C62]/8 px-2 py-0.5 rounded-full">
                                {r.cuisine}
                              </span>
                            </div>
                            <span className="text-2xl" title={r.cuisine}>{CUISINE_EMOJIS[r.cuisine] || "🍽️"}</span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mb-4 text-[#957C62]/60">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs font-semibold">{r.average_delivery_time} min delivery</span>
                            </div>
                          </div>

                          {/* Menu preview */}
                          <div className="space-y-1.5 mb-4 flex-1">
                            {r.menu_items?.slice(0, 3).map((item) => (
                              <div key={item.item_id} className="flex justify-between text-xs">
                                <span className="text-[#957C62]/70 truncate mr-2">{item.name}</span>
                                <span className="text-[#957C62] font-bold flex-shrink-0">Rs. {item.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA */}
                          <div className="flex items-center justify-end gap-1 text-[#B77466] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                            View Menu <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-[#957C62]/60 font-medium">No restaurants match your search.</p>
              </div>
            )}
          </>
        )}
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} setCart={setCart} user={user} cartTotal={cartTotal} />
    </div>
  );
}
