"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getNodes, getEdges } from "@/lib/api";
import { MapNode, MapEdge } from "@/lib/types";
import { Network, Database, Layers, Hash } from "lucide-react";

export default function AnalyticsPage() {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<MapEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [n, e] = await Promise.all([getNodes(), getEdges()]);
        setNodes(n);
        setEdges(e);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary tracking-tight mb-2">Relational Analytics</h1>
        <p className="text-secondary/70 font-medium">Deep inspection of the PostgreSQL graph schema and topology density.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white/40 border-b border-secondary/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center">
                <Database className="h-4 w-4 mr-2 text-primary" />
                Table: MapNode
              </h2>
              <span className="text-xs font-bold text-secondary/60">{nodes.length} Rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-secondary/10">
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Node ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">X Coord</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Y Coord</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/5">
                  {nodes.map((node) => (
                    <tr key={node.node_id} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-primary">{node.node_id}</td>
                      <td className="px-6 py-3 text-sm font-medium text-secondary">{node.name}</td>
                      <td className="px-6 py-3 text-sm text-secondary/70 font-mono">{node.x_coordinate.toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-secondary/70 font-mono">{node.y_coordinate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-secondary/10 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white/40 border-b border-secondary/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center">
                <Layers className="h-4 w-4 mr-2 text-primary" />
                Table: MapEdge (Topology)
              </h2>
              <span className="text-xs font-bold text-secondary/60">{edges.length} Edges</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-secondary/10">
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Edge ID</th>
                    <th className="px-6 py-1 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Relationship</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-secondary/60 uppercase tracking-wider">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/5">
                  {edges.map((edge) => (
                    <tr key={edge.edge_id} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-secondary">{edge.edge_id}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center text-xs font-bold text-secondary/70">
                          <span className="bg-white/60 border border-secondary/10 px-1.5 py-0.5 rounded shadow-sm">{edge.from_node}</span>
                          <span className="mx-2 text-primary">→</span>
                          <span className="bg-white/60 border border-secondary/10 px-1.5 py-0.5 rounded shadow-sm">{edge.to_node}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-secondary/70 font-mono">{edge.distance.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <div className="h-1.5 w-16 bg-secondary/10 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min(edge.distance * 10, 100)}%` }} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-6 text-secondary border border-secondary/10 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Network className="h-5 w-5 mr-3 text-primary" />
              Graph Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 p-4 rounded-md border border-secondary/10 text-center shadow-sm">
                <p className="text-[10px] font-bold text-secondary/70 uppercase mb-1">Avg. Node Degree</p>
                <p className="text-2xl font-bold">{(edges.length * 2 / Math.max(nodes.length, 1)).toFixed(2)}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-md border border-secondary/10 text-center shadow-sm">
                <p className="text-[10px] font-bold text-secondary/70 uppercase mb-1">Density Index</p>
                <p className="text-2xl font-bold">{(edges.length / (nodes.length * (nodes.length - 1) / 2 || 1)).toFixed(3)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
