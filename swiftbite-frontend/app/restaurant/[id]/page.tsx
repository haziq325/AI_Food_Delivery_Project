"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import CartDrawer, { CartItem, UserSession } from "../../components/CartDrawer";

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

interface Review {
  user_name: string;
  rating: number;
  review: string | null;
  created_at: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const CUISINE_EMOJIS: Record<string, string> = {
  "Fast Food": "🍔", "Pakistani": "🍛", "BBQ": "🔥", "Pizza": "🍕",
  "Chinese": "🥡", "Pan-Asian": "🍜", "Cafe": "☕", "Fine Dining": "✨",
  "Healthy": "🥗", "American": "🦅",
};

const CUISINE_IMAGES: Record<string, string> = {
  "All": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "Fast Food": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80",
  "Pakistani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
  "BBQ": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  "Chinese": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=80",
  "Pan-Asian": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
  "Cafe": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
  "Fine Dining": "https://images.unsplash.com/photo-1414235077428-338988692286?auto=format&fit=crop&w=1200&q=80",
  "Healthy": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  "American": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1200&q=80",
};

const RESTAURANT_IMAGES: Record<string, string> = {
  "Burger O'Clock": "https://oocmjiuymmvwvyvwlfpd.supabase.co/storage/v1/object/public/Project/download.jpg ",
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

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserSession | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

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
      .then((data: Restaurant[]) => {
        const found = data.find((r) => r.restaurant_id === Number(id));
        setRestaurant(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch reviews
    fetch(`${API}/api/restaurants/${id}/reviews/`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data);
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  }, [id]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
  }, [router]);

  const addToCart = (item: MenuItem) => {
    if (!restaurant) return;

    // If cart has items from a different restaurant, clear first
    if (cart.length > 0 && cart[0].restaurant_id !== restaurant.restaurant_id) {
      setCart([]);
    }

    setCart((prev) => {
      const exists = prev.find((c) => c.item_id === item.item_id);
      if (exists) {
        return prev.map((c) => c.item_id === item.item_id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        item_id: item.item_id, name: item.name, price: item.price,
        quantity: 1, restaurant_id: restaurant.restaurant_id, restaurant_name: restaurant.name,
      }];
    });

    setAddedId(item.item_id);
    setTimeout(() => setAddedId(null), 800);
  };

  const getItemQty = (item_id: number) => {
    const found = cart.find((c) => c.item_id === item_id);
    return found ? found.quantity : 0;
  };

  const updateQty = (item_id: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.item_id === item_id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen food-grain-bg">
        <Navbar user={user} cartCount={cartCount} onCartClick={() => setCartOpen(true)} onLogout={logout} onLocationUpdate={setUser} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="glass-card rounded-2xl p-8 animate-pulse">
            <div className="h-6 bg-[#957C62]/10 rounded w-1/3 mb-4" />
            <div className="h-4 bg-[#957C62]/10 rounded w-1/4 mb-8" />
            <div className="space-y-4">{[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#957C62]/10 rounded-xl" />
            ))}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen food-grain-bg">
        <Navbar user={user} cartCount={cartCount} onCartClick={() => setCartOpen(true)} onLogout={logout} onLocationUpdate={setUser} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-[#957C62] font-bold text-lg">Restaurant not found</p>
          <Link href="/home" className="text-[#B77466] text-sm font-semibold hover:underline mt-2 inline-block">← Back to restaurants</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen food-grain-bg">
      <Navbar user={user} cartCount={cartCount} onCartClick={() => setCartOpen(true)} onLogout={logout} onLocationUpdate={setUser} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/home" className="inline-flex items-center gap-1.5 text-xs text-[#957C62]/60 hover:text-[#B77466] font-semibold transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All Restaurants
        </Link>

        {/* Restaurant header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden mb-8 border border-[#957C62]/10">
          <div className="h-48 sm:h-64 w-full relative">
            <img src={RESTAURANT_IMAGES[restaurant.name] || CUISINE_IMAGES[restaurant.cuisine] || CUISINE_IMAGES["All"]} alt={restaurant.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full text-white">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-2">{restaurant.name}</h1>
                  <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    {restaurant.cuisine}
                  </span>
                  <div className="flex items-center gap-5 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
                      <span className="text-sm font-black">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-90">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-semibold">{restaurant.average_delivery_time} min</span>
                    </div>
                  </div>
                </div>
                <span className="text-5xl drop-shadow-md hidden sm:block">{CUISINE_EMOJIS[restaurant.cuisine] || "🍽️"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <h2 className="text-lg font-black text-[#957C62] mb-5">Menu</h2>
        <div className="space-y-3">
          {restaurant.menu_items?.map((item, i) => {
            const qty = getItemQty(item.item_id);
            return (
              <motion.div key={item.item_id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4 border border-transparent hover:border-[#B77466]/15 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#957C62] text-sm">{item.name}</p>
                  <p className="text-[#B77466] font-black text-sm mt-1">Rs. {item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-[#B77466]/10 rounded-full px-1 py-1">
                      <button onClick={() => updateQty(item.item_id, -1)}
                        className="w-7 h-7 rounded-full bg-white/80 text-[#957C62] flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-black text-[#B77466] w-4 text-center text-sm">{qty}</span>
                      <button onClick={() => updateQty(item.item_id, 1)}
                        className="w-7 h-7 rounded-full bg-[#B77466] text-white flex items-center justify-center hover:bg-[#9c6052] transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-1.5 bg-[#B77466] text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-[#9c6052] transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </motion.button>
                  )}

                  <AnimatePresence>
                    {addedId === item.item_id && (
                      <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }} className="text-green-500 text-xs font-bold">
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reviews Section */}
        <div className="mt-12 mb-20">
          <h2 className="text-lg font-black text-[#957C62] mb-5 flex items-center gap-2">
            Reviews 
            <span className="text-xs font-bold text-[#957C62]/40 bg-[#957C62]/5 px-2 py-0.5 rounded-full">
              {reviews.length}
            </span>
          </h2>
          
          {reviewsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-[#957C62]/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border-dashed border-2 border-[#957C62]/10">
              <p className="text-xs text-[#957C62]/50 font-bold uppercase tracking-widest">No reviews yet. Be the first to order and rate!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-5 border border-[#957C62]/8"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#B77466]/10 flex items-center justify-center text-[10px] font-black text-[#B77466]">
                        {rev.user_name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#957C62]">{rev.user_name}</p>
                        <p className="text-[9px] text-[#957C62]/40 font-bold uppercase">{new Date(rev.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black text-amber-700">{rev.rating}</span>
                    </div>
                  </div>
                  {rev.review && (
                    <p className="text-xs text-[#957C62]/80 leading-relaxed mt-2 pl-9 italic">
                      "{rev.review}"
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky cart bar */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFE1AF]/95 backdrop-blur-md border-t border-[#957C62]/15 px-4 py-4 z-30">
              <div className="max-w-4xl mx-auto">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setCartOpen(true)}
                  className="w-full bg-[#B77466] text-white font-black py-4 rounded-2xl flex items-center justify-between px-6 shadow-lg shadow-[#B77466]/25 hover:bg-[#9c6052] transition-colors">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount} item{cartCount !== 1 ? "s" : ""} in cart
                  </span>
                  <span>Rs. {cartTotal.toLocaleString()} →</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} setCart={setCart} user={user} cartTotal={cartTotal} />
    </div>
  );
}
