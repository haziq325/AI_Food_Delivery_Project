"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getAnalytics } from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Bike, DollarSign, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await getAnalytics();
        setData(result);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-secondary/50 font-mono text-xs uppercase tracking-widest">Accessing Secure Analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const COLORS = ['#B77466', '#957C62', '#D9B4A0', '#4A4A4A', '#8C8C8C'];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-secondary uppercase">Enterprise Analytics</h1>
        <p className="text-secondary/70 mt-1 font-mono text-sm uppercase tracking-wider">Live System Metrics & Performance</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Revenue" 
          value={`Rs. ${data.total_revenue.toLocaleString()}`} 
          sub="Lifetime Earnings"
          icon={<DollarSign className="h-5 w-5" />}
          color="bg-emerald-500"
        />
        <MetricCard 
          title="Avg Delivery Time" 
          value={`${data.avg_delivery_time}m`} 
          sub="Network Average"
          icon={<Clock className="h-5 w-5" />}
          color="bg-primary"
        />
        <MetricCard 
          title="Available Riders" 
          value={data.fleet_status.available} 
          sub={`${data.fleet_status.busy} currently busy`}
          icon={<Bike className="h-5 w-5" />}
          color="bg-blue-500"
        />
        <MetricCard 
          title="Network Efficiency" 
          value="94.2%" 
          sub="+2.4% from last week"
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-secondary uppercase text-sm tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue Trajectory (Last 7 Days)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenue_history}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B77466" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#B77466" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#957C62', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#957C62', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid rgba(149, 124, 98, 0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#B77466" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Restaurants */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-secondary uppercase text-sm tracking-widest flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Market Dominance (Top Restaurants)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_restaurants} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#957C62', fontSize: 10}} width={120} />
                <Tooltip 
                  cursor={{fill: 'rgba(183, 116, 102, 0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid rgba(149, 124, 98, 0.1)' }}
                />
                <Bar dataKey="orders" fill="#B77466" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.top_restaurants.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Fleet Efficiency */}
      <div className="mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-secondary uppercase text-sm tracking-widest flex items-center gap-2">
              <Bike className="h-4 w-4 text-primary" />
              Fleet Distribution
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Available', value: data.fleet_status.available },
                      { name: 'Busy', value: data.fleet_status.busy }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Fleet Readiness</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-secondary">
                    {Math.round((data.fleet_status.available / (data.fleet_status.available + data.fleet_status.busy)) * 100)}%
                  </span>
                  <span className="text-[10px] text-secondary/50 mb-1.5 font-mono italic">Operational capacity</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] uppercase font-bold text-primary mb-1">Congestion Alert</p>
                <p className="text-xs text-secondary/70">Moderate activity in Saddar Node. Recommend re-routing 2 riders.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ title, value, sub, icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={cn("p-2 rounded-lg text-white shadow-sm transition-transform group-hover:scale-110", color)}>
          {icon}
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      </div>
      <div>
        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h4 className="text-xl font-bold text-secondary">{value}</h4>
        <p className="text-[10px] text-secondary/60 mt-1.5 font-medium">{sub}</p>
      </div>
    </motion.div>
  );
}
