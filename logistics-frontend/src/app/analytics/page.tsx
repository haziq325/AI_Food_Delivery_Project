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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Relational Analytics</h1>
        <p className="text-slate-500 font-medium">Deep inspection of the PostgreSQL graph schema and topology density.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center">
                <Database className="h-4 w-4 mr-2 text-primary" />
                Table: MapNode
              </h2>
              <span className="text-xs font-bold text-slate-400">{nodes.length} Rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Node ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">X Coord</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Y Coord</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nodes.map((node) => (
                    <tr key={node.node_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-primary">{node.node_id}</td>
                      <td className="px-6 py-3 text-sm font-medium text-slate-700">{node.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 font-mono">{node.x_coordinate.toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 font-mono">{node.y_coordinate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center">
                <Layers className="h-4 w-4 mr-2 text-primary" />
                Table: MapEdge (Topology)
              </h2>
              <span className="text-xs font-bold text-slate-400">{edges.length} Edges</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edge ID</th>
                    <th className="px-6 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relationship</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {edges.map((edge) => (
                    <tr key={edge.edge_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-slate-900">{edge.edge_id}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center text-xs font-bold text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{edge.from_node}</span>
                          <span className="mx-2 text-primary">→</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{edge.to_node}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 font-mono">{edge.distance.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full">
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

          <div className="bg-slate-900 rounded-md p-6 text-white border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Network className="h-5 w-5 mr-3 text-primary" />
              Graph Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded border border-white/10 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg. Node Degree</p>
                <p className="text-2xl font-bold">{(edges.length * 2 / Math.max(nodes.length, 1)).toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded border border-white/10 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Density Index</p>
                <p className="text-2xl font-bold">{(edges.length / (nodes.length * (nodes.length - 1) / 2 || 1)).toFixed(3)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
