"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
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
  comparisonPath?: number[];
  originNodeId?: number;
  destinationNodeId?: number;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

const KARACHI_LAT = 24.8607;
const KARACHI_LNG = 67.0011;
const SCALE = 0.01; // Scale arbitrary coordinates so they fit within city limits

const getMapCoords = (x: number, y: number): [number, number] => {
  return [KARACHI_LAT + (y * SCALE), KARACHI_LNG + (x * SCALE)];
};

// Internal component to handle map bounds and fitting
function MapBoundsHandler({ nodes }: { nodes: MapNode[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (nodes.length > 0) {
      const bounds = L.latLngBounds(nodes.map(n => getMapCoords(n.x_coordinate, n.y_coordinate)));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [nodes, map]);
  
  return null;
}

export default function LeafletMap({
  nodes,
  edges,
  activePath = [],
  comparisonPath = [],
  originNodeId,
  destinationNodeId,
  className,
  center = [KARACHI_LAT, KARACHI_LNG],
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
                getMapCoords(from.x_coordinate, from.y_coordinate),
                getMapCoords(to.x_coordinate, to.y_coordinate)
              ]}
              pathOptions={{
                color: "#cbd5e1",
                weight: 1.5,
                dashArray: "4, 8",
                opacity: 0.3
              }}
            >
              <Tooltip permanent direction="center" className="bg-transparent border-none text-secondary/60 font-mono text-[9px] font-bold shadow-none" opacity={0.7}>
                {edge.distance} km
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Comparison Path (Dijkstra) - Amber/Warning Color */}
        {comparisonPath.length > 1 && (
          <Polyline
            positions={comparisonPath
              .map(nodeId => nodes.find(n => n.node_id === nodeId))
              .filter((node): node is MapNode => !!node)
              .map(node => getMapCoords(node.x_coordinate, node.y_coordinate))
            }
            pathOptions={{
              color: "#f59e0b", // Amber warning color
              weight: 5,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "10, 10",
              fill: false
            }}
          />
        )}

        {/* Active Delivery Path - Electric Blue */}
        {activePath.length > 1 && (
          <Polyline
            positions={activePath
              .map(nodeId => nodes.find(n => n.node_id === nodeId))
              .filter((node): node is MapNode => !!node)
              .map(node => getMapCoords(node.x_coordinate, node.y_coordinate))
            }
            pathOptions={{
              color: "#0052FF",
              weight: 5,
              lineCap: "round",
              lineJoin: "round",
              fill: false
            }}
          />
        )}

        {/* Nodes (Intersections) */}
        {nodes.map((node) => {
          const isInPath = activePath.includes(node.node_id) || comparisonPath.includes(node.node_id);
          const isOrigin = node.node_id === originNodeId;
          const isDest = node.node_id === destinationNodeId;
          
          let fillColor = "#334155";
          let radius = isInPath ? 6 : 4;
          
          if (isOrigin) {
            fillColor = "#10b981"; // Emerald Green
            radius = 8;
          } else if (isDest) {
            fillColor = "#ef4444"; // Rose Red
            radius = 8;
          } else if (isInPath) {
            fillColor = "#0052FF"; // Electric Blue
          }

          return (
            <CircleMarker
              key={`node-${node.node_id}`}
              center={getMapCoords(node.x_coordinate, node.y_coordinate)}
              radius={radius}
              pathOptions={{
                fillColor: fillColor,
                fillOpacity: 1,
                color: (isOrigin || isDest || isInPath) ? "#ffffff" : "#1e293b",
                weight: (isOrigin || isDest) ? 2 : 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-xs font-bold font-mono">
                  {isOrigin && <span className="text-emerald-500 mr-1">[START]</span>}
                  {isDest && <span className="text-rose-500 mr-1">[END]</span>}
                  NODE {node.node_id}: {node.name}
                </div>
              </Tooltip>
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
            PRIMARY TRAJECTORY
        </div>
        {comparisonPath.length > 1 && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-[10px] font-bold text-slate-300 flex items-center">
              <div className="h-2 w-2 bg-amber-500 rounded-full mr-2" />
              COMPARISON PATH
          </div>
        )}
      </div>
    </div>
  );
}
