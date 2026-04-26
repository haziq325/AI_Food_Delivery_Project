"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface Node {
  node_id: number;
  name: string;
  x_coordinate: number;
  y_coordinate: number;
}

interface Edge {
  edge_id: number;
  from_node: number;
  to_node: number;
}

interface LiveMapProps {
  path: string | null;
  status: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function LiveMap({ path, status }: LiveMapProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/nodes/`).then(r => r.json()),
      fetch(`${API}/api/edges/`).then(r => r.json())
    ]).then(([nodesData, edgesData]) => {
      setNodes(nodesData);
      setEdges(edgesData);
      setLoading(false);
    }).catch(err => {
      console.error("Map fetch failed", err);
      setLoading(false);
    });
  }, []);

  // Path parsing
  const pathNodeIds = useMemo(() => {
    if (!path) return [];
    return path.split(",").map(n => parseInt(n.trim()));
  }, [path]);

  // Scaling logic
  const padding = 40;
  const width = 400;
  const height = 400;

  // Find bounds for dynamic scaling (or use hardcoded Karachi bounds)
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: -6, maxX: 8, minY: -7, maxY: 7 };
    return {
      minX: Math.min(...nodes.map(n => n.x_coordinate)),
      maxX: Math.max(...nodes.map(n => n.x_coordinate)),
      minY: Math.min(...nodes.map(n => n.y_coordinate)),
      maxY: Math.max(...nodes.map(n => n.y_coordinate))
    };
  }, [nodes]);

  const scaleX = (x: number) => {
    const range = bounds.maxX - bounds.minX || 1;
    return ((x - bounds.minX) / range) * (width - padding * 2) + padding;
  };

  const scaleY = (y: number) => {
    const range = bounds.maxY - bounds.minY || 1;
    // Invert Y for SVG (high Y at top)
    return height - (((y - bounds.minY) / range) * (height - padding * 2) + padding);
  };

  if (loading || nodes.length === 0) {
    return <div className="h-48 w-full bg-[#957C62]/5 rounded-xl animate-pulse flex items-center justify-center text-[10px] text-[#957C62]/40 font-bold uppercase tracking-widest">Loading Map Intelligence...</div>;
  }

  // Build path polyline points
  const pathPoints = pathNodeIds.map(id => {
    const node = nodes.find(n => n.node_id === id);
    if (!node) return null;
    return { x: scaleX(node.x_coordinate), y: scaleY(node.y_coordinate) };
  }).filter(p => p !== null) as { x: number, y: number }[];

  const pathD = pathPoints.length > 0 
    ? `M ${pathPoints[0].x} ${pathPoints[0].y} ${pathPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")}`
    : "";

  return (
    <div className="relative w-full aspect-square bg-[#957C62]/5 rounded-xl border border-[#957C62]/10 overflow-hidden shadow-inner">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-sm">
        {/* All Edges (Static Background) */}
        {edges.map(edge => {
          const from = nodes.find(n => n.node_id === edge.from_node);
          const to = nodes.find(n => n.node_id === edge.to_node);
          if (!from || !to) return null;
          return (
            <line
              key={edge.edge_id}
              x1={scaleX(from.x_coordinate)}
              y1={scaleY(from.y_coordinate)}
              x2={scaleX(to.x_coordinate)}
              y2={scaleY(to.y_coordinate)}
              stroke="#957C62"
              strokeWidth="1.5"
              strokeOpacity="0.1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* All Nodes */}
        {nodes.map(node => (
          <circle
            key={node.node_id}
            cx={scaleX(node.x_coordinate)}
            cy={scaleY(node.y_coordinate)}
            r="3"
            fill="#957C62"
            fillOpacity="0.2"
          />
        ))}

        {/* Active Delivery Path (Highlighted) */}
        {pathD && (
          <>
            <motion.path
              d={pathD}
              fill="none"
              stroke="#B77466"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Inner path for glow */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="#B77466"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(183,116,102,0.8)]"
            />
          </>
        )}

        {/* The Rider (Animated Dot) */}
        {pathPoints.length > 0 && status !== "Delivered" && status !== "Cancelled" && (
          <motion.circle
            r="6"
            fill="#B77466"
            className="drop-shadow-[0_0_10px_rgba(183,116,102,0.6)]"
            animate={{
              cx: pathPoints.map(p => p.x),
              cy: pathPoints.map(p => p.y),
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        
        {/* Endpoints */}
        {pathPoints.length > 0 && (
          <>
            {/* Restaurant */}
            <circle cx={pathPoints[0].x} cy={pathPoints[0].y} r="5" fill="#B77466" />
            <text x={pathPoints[0].x} y={pathPoints[0].y - 12} textAnchor="middle" className="text-[14px] font-black fill-[#B77466]">🏠</text>
            
            {/* Destination */}
            <circle cx={pathPoints[pathPoints.length-1].x} cy={pathPoints[pathPoints.length-1].y} r="5" fill="#957C62" />
            <text x={pathPoints[pathPoints.length-1].x} y={pathPoints[pathPoints.length-1].y - 12} textAnchor="middle" className="text-[14px] font-black fill-[#957C62]">📍</text>
          </>
        )}
      </svg>
      
      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#B77466]" />
          <span className="text-[10px] font-black text-[#B77466] uppercase tracking-widest">Active Trajectory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#957C62]/20" />
          <span className="text-[10px] font-black text-[#957C62]/40 uppercase tracking-widest">Road Network</span>
        </div>
      </div>
    </div>
  );
}
