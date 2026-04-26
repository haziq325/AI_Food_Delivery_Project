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
    <div className="flex h-full w-64 flex-col bg-[#FFE1AF]/80 backdrop-blur-xl border-r border-secondary/10 shadow-[4px_0_24px_rgba(183,116,102,0.05)] z-50">
      <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-10">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center mr-3 shadow-sm">
            <BarChart3 className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-secondary tracking-tight">
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
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-secondary/70 hover:bg-white/40 hover:text-secondary"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-secondary/50 group-hover:text-secondary"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex flex-col border-t border-secondary/10 p-4">
        <div className="flex items-center mb-5">
          <div className="inline-block h-8 w-8 rounded-md bg-white flex items-center justify-center text-[10px] text-primary font-bold border border-secondary/10 uppercase shadow-sm">
            MA
          </div>
          <div className="ml-3">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Mawavia Lead</p>
            <p className="text-[9px] font-medium text-secondary/60">Security Clearance: Lvl 4</p>
          </div>
        </div>
        <Link 
          href="/login"
          className="w-full flex items-center justify-center py-2.5 px-2 border border-secondary/20 rounded-md text-[10px] font-bold text-secondary/70 uppercase tracking-[0.15em] hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 hover:shadow-sm transition-all group"
        >
          <LogOut className="mr-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span className="truncate">Protocol: Terminate</span>
        </Link>
      </div>
    </div>
  );
}
