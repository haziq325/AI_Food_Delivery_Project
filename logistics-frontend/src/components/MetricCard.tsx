import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_32px_0_rgba(183,116,102,0.15)]", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {change && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider",
            isPositive ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          )}>
            {isPositive ? "UP" : "DOWN"} {change}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-bold text-secondary/70 uppercase tracking-[0.2em] mb-2">{title}</h3>
        <p className="text-3xl font-bold text-secondary tracking-tight data-value drop-shadow-sm">{value}</p>
      </div>
    </div>
  );
}
