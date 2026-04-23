"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, Map, Network, Settings, LogOut, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Intelligence", href: "/intelligence", icon: LayoutDashboard },
  { name: "Dispatch", href: "/dispatch", icon: Send },
  { name: "Network Map", href: "/network-map", icon: Map },
  { name: "Relational Analytics", href: "/analytics", icon: Network },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-secondary border-r border-white/10">
      <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-10">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center mr-3">
            <BarChart3 className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            KINETIC <span className="text-primary">AI</span>
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex flex-col border-t border-white/10 p-4">
        <div className="flex items-center mb-4">
          <div className="inline-block h-8 w-8 rounded-sm bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold border border-white/5 uppercase">
            MA
          </div>
          <div className="ml-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Mawavia Lead</p>
            <p className="text-[10px] font-medium text-slate-500">Security Clearance: LEVEL 4</p>
          </div>
        </div>
        <Link 
          href="/login"
          className="w-full flex items-center justify-center py-2 border border-white/10 rounded-sm text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all group"
        >
          <LogOut className="mr-2 h-3 w-3 group-hover:scale-110 transition-transform" />
          Protocol: Termination
        </Link>
      </div>
    </div>
  );
}
