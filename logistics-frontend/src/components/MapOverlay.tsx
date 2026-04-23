"use client";

import { useEffect, useState, useRef } from "react";
import { MapNode, MapEdge } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MapOverlayProps {
  nodes: MapNode[];
  edges: MapEdge[];
  activePath?: number[];
  comparisonPath?: number[]; // For Dijkstra vs A* comparison
  showComparison?: boolean;
  className?: string;
}

export default function MapOverlay({
  nodes,
  edges,
  activePath = [],
  comparisonPath = [],
  showComparison = false,
  className,
}: MapOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate bounds for scaling
  const minX = Math.min(...nodes.map(n => n.x_coordinate), 0);
  const maxX = Math.max(...nodes.map(n => n.x_coordinate), 10);
  const minY = Math.min(...nodes.map(n => n.y_coordinate), 0);
  const maxY = Math.max(...nodes.map(n => n.y_coordinate), 10);

  const padding = 50;
  const width = 800;
  const height = 600;

  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * (width - 2 * padding) + padding;
  const scaleY = (y: number) => height - (((y - minY) / (maxY - minY)) * (height - 2 * padding) + padding);

  return (
    <div className={cn("relative bg-slate-950 rounded-md overflow-hidden border border-white/10 shadow-2xl", className)}>
      <div className="absolute top-4 left-6 z-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Grid Topology</h3>
        <p className="text-xl font-bold text-white tracking-tight">Active Visualization</p>
      </div>

      <div className="absolute top-4 right-6 z-10 flex gap-4">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-primary rounded-full mr-2 shadow-[0_0_8px_#0052FF]" />
          <span className="text-xs font-bold text-slate-300">A* Path</span>
        </div>
        {showComparison && (
          <div className="flex items-center">
            <div className="h-3 w-3 bg-amber-500 rounded-full mr-2 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-bold text-slate-300">Dijkstra</span>
          </div>
        )}
      </div>

      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto max-h-[600px] select-none"
      >
        {/* Glow Filters */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Regular Edges */}
        {edges.map((edge) => {
          const from = nodes.find(n => n.node_id === edge.from_node);
          const to = nodes.find(n => n.node_id === edge.to_node);
          if (!from || !to) return null;

          return (
            <line
              key={`edge-${edge.edge_id}`}
              x1={scaleX(from.x_coordinate)}
              y1={scaleY(from.y_coordinate)}
              x2={scaleX(to.x_coordinate)}
              y2={scaleY(to.y_coordinate)}
              stroke="#1e293b"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Dijkstra Path (if comparison mode) */}
        {showComparison && comparisonPath.map((nodeId, i) => {
          if (i === 0) return null;
          const from = nodes.find(n => n.node_id === comparisonPath[i-1]);
          const to = nodes.find(n => n.node_id === nodeId);
          if (!from || !to) return null;

          return (
            <line
              key={`dijkstra-${i}`}
              x1={scaleX(from.x_coordinate)}
              y1={scaleY(from.y_coordinate)}
              x2={scaleX(to.x_coordinate)}
              y2={scaleY(to.y_coordinate)}
              stroke="#f59e0b"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glow)"
              className="animate-pulse"
            />
          );
        })}

        {/* Active A* Path */}
        {activePath.map((nodeId, i) => {
          if (i === 0) return null;
          const from = nodes.find(n => n.node_id === activePath[i-1]);
          const to = nodes.find(n => n.node_id === nodeId);
          if (!from || !to) return null;

          return (
            <line
              key={`active-${i}`}
              x1={scaleX(from.x_coordinate)}
              y1={scaleY(from.y_coordinate)}
              x2={scaleX(to.x_coordinate)}
              y2={scaleY(to.y_coordinate)}
              stroke="#0052FF"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isInPath = activePath.includes(node.node_id);
          const isComparison = comparisonPath.includes(node.node_id);
          
          return (
            <g key={`node-${node.node_id}`}>
              <circle
                cx={scaleX(node.x_coordinate)}
                cy={scaleY(node.y_coordinate)}
                r={isInPath ? "8" : "5"}
                fill={isInPath ? "#0052FF" : isComparison ? "#f59e0b" : "#334155"}
                className={cn(
                  "transition-all duration-300",
                  isInPath && "filter drop-shadow-[0_0_8px_rgba(0,82,255,0.8)]"
                )}
              />
              <text
                x={scaleX(node.x_coordinate)}
                y={scaleY(node.y_coordinate) - 15}
                textAnchor="middle"
                className={cn(
                  "text-[10px] font-bold fill-slate-500 pointer-events-none",
                  isInPath && "fill-white text-xs"
                )}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
