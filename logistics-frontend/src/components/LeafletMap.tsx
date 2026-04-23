"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapNode, MapEdge } from "@/lib/types";
import { cn } from "@/lib/utils";

// Fix Leaflet marker icons issue in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

interface LeafletMapProps {
  nodes: MapNode[];
  edges: MapEdge[];
  activePath?: number[];
  className?: string;
  center?: [number, number];
  zoom?: number;
}

// Internal component to handle map bounds and fitting
function MapBoundsHandler({ nodes }: { nodes: MapNode[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (nodes.length > 0) {
      const bounds = L.latLngBounds(nodes.map(n => [n.y_coordinate, n.x_coordinate] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [nodes, map]);
  
  return null;
}

export default function LeafletMap({
  nodes,
  edges,
  activePath = [],
  className,
  center = [0, 0],
  zoom = 13,
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fixLeafletIcons();
  }, []);

  if (!isMounted) return <div className={cn("bg-slate-900 animate-pulse", className)} />;

  return (
    <div className={cn("relative rounded-md overflow-hidden border border-white/10 shadow-2xl z-0", className)}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="h-full w-full bg-[#111111]"
      >
        {/* Dark Mode Tiles - CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsHandler nodes={nodes} />

        {/* Regular Edges (Roads) */}
        {edges.map((edge) => {
          const from = nodes.find(n => n.node_id === edge.from_node);
          const to = nodes.find(n => n.node_id === edge.to_node);
          if (!from || !to) return null;

          return (
            <Polyline
              key={`edge-${edge.edge_id}`}
              positions={[
                [from.y_coordinate, from.x_coordinate],
                [to.y_coordinate, to.x_coordinate]
              ]}
              pathOptions={{
                color: "#1e293b",
                weight: 2,
                dashArray: "5, 10",
                opacity: 0.5
              }}
            />
          );
        })}

        {/* Active Delivery Path - Electric Blue */}
        {activePath.length > 1 && (
          <Polyline
            positions={activePath.map(nodeId => {
              const node = nodes.find(n => n.node_id === nodeId);
              return node ? [node.y_coordinate, node.x_coordinate] : [0, 0];
            }) as [number, number][]}
            pathOptions={{
              color: "#0052FF",
              weight: 5,
              lineCap: "round",
              lineJoin: "round",
              fill: false
            }}
            eventHandlers={{
                add: (e) => {
                    const polyline = e.target;
                    polyline.setStyle({
                        filter: 'drop-shadow(0 0 8px #0052FF)'
                    } as any);
                }
            }}
          />
        )}

        {/* Nodes (Intersections) */}
        {nodes.map((node) => {
          const isInPath = activePath.includes(node.node_id);
          
          return (
            <CircleMarker
              key={`node-${node.node_id}`}
              center={[node.y_coordinate, node.x_coordinate]}
              radius={isInPath ? 6 : 4}
              pathOptions={{
                fillColor: isInPath ? "#0052FF" : "#334155",
                fillOpacity: 1,
                color: isInPath ? "#ffffff" : "#1e293b",
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-xs font-bold font-mono">
                  NODE: {node.name}<br/>
                  COORD: [{node.x_coordinate}, {node.y_coordinate}]
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map HUD Overlay */}
      <div className="absolute top-4 left-6 z-[1000] pointer-events-none">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Network Topology</h3>
        <p className="text-xl font-bold text-white tracking-tight drop-shadow-md">RELATIONAL GRAPH</p>
      </div>

      <div className="absolute bottom-4 right-6 z-[1000] flex gap-3 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-[10px] font-bold text-slate-300 flex items-center">
            <div className="h-2 w-2 bg-primary animate-pulse rounded-full mr-2" />
            LIVE TRAJECTORY
        </div>
      </div>
    </div>
  );
}
