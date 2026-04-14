"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useWorldStats } from "@/lib/useWorldStats";
import { useChunkWebSocket } from "@/lib/useChunkWebSocket";
import { StatsPanel } from "./StatsPanel";
import { CoordDisplay } from "./CoordDisplay";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Minecraft chunk coordinate system → Leaflet coordinate system
// We use CRS.Simple so 1 Leaflet unit = 1 chunk block column
// Leaflet Y is inverted (grows down), Minecraft Z also grows south — no flip needed

const CHUNK_PX = 64; // pixels per chunk tile at zoom 0 (must match backend ChunkPixels)
const REGION_CHUNKS = 32;

// Custom CRS: 1 unit = 1 block, origin at 0,0
function createMinecraftCRS() {
  return L.extend({}, L.CRS.Simple, {
    // No transformation needed — 1:1 block coords
    transformation: new L.Transformation(1, 0, 1, 0),
  });
}

// TileLayer that fetches region PNGs from our Go backend
function createRegionLayer(url: string) {
  return L.tileLayer(`${url}/api/region/{x}/{y}`, {
    tileSize: CHUNK_PX * REGION_CHUNKS, // 2048px per tile
    minZoom: -4,
    maxZoom: 3,
    noWrap: true,
    // Leaflet passes {x} and {y} as tile coords; our backend expects region coords
    // which match Leaflet tile coords at zoom 0 with our tileSize
  });
}

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.TileLayer | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; z: number } | null>(null);
  const stats = useWorldStats(API);

  // Invalidate tile layer on WS update
  const onUpdate = useCallback(() => {
    layerRef.current?.redraw();
  }, []);
  useChunkWebSocket(API, onUpdate);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      crs: createMinecraftCRS(),
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      minZoom: -4,
      maxZoom: 3,
      zoom: 0,
      center: [0, 0],
      attributionControl: false,
    });

    mapRef.current = map;

    // Region tile layer
    const layer = createRegionLayer(API);
    layer.addTo(map);
    layerRef.current = layer;

    // Grid overlay at zoom > 1
    const grid = L.gridLayer({
      tileSize: CHUNK_PX,
      opacity: 0.3,
    });
    // @ts-ignore
    grid.createTile = function () {
      const tile = document.createElement("div");
      tile.style.border = "1px solid rgba(255,255,255,0.1)";
      return tile;
    };

    map.on("zoomend", () => {
      if (map.getZoom() >= 1) {
        map.addLayer(grid);
      } else {
        map.removeLayer(grid);
      }
    });

    // Track mouse position in Minecraft block coords
    map.on("mousemove", (e) => {
      setMousePos({
        x: Math.floor(e.latlng.lng * REGION_CHUNKS * 16),
        z: Math.floor(e.latlng.lat * REGION_CHUNKS * 16),
      });
    });
    map.on("mouseout", () => setMousePos(null));

    // Center on world bounds once stats load
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Pan to world center when stats arrive
  useEffect(() => {
    if (!mapRef.current || !stats) return;
    const { minX, maxX, minZ, maxZ } = stats.bounds;
    const cx = ((minX + maxX) / 2) / REGION_CHUNKS;
    const cz = ((minZ + maxZ) / 2) / REGION_CHUNKS;
    mapRef.current.setView([cz, cx], 0);
  }, [stats]);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-green-400 font-bold text-sm tracking-wider">⛏ MCMap</span>
          <span className="text-zinc-500 text-xs">Bedrock Viewer</span>
        </div>
        {stats && <StatsPanel stats={stats} />}
      </div>

      {mousePos && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <CoordDisplay x={mousePos.x} z={mousePos.z} />
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  const entries = [
    { color: "#6a7f4b", label: "Grass" },
    { color: "#3f76e4", label: "Water" },
    { color: "#808080", label: "Stone" },
    { color: "#dbcfa3", label: "Sand" },
    { color: "#ebf0f5", label: "Snow" },
    { color: "#cf570e", label: "Lava" },
  ];
  return (
    <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-2">
      <div className="text-zinc-400 text-xs mb-1.5 font-semibold">Biome Colors</div>
      <div className="flex flex-col gap-1">
        {entries.map((e) => (
          <div key={e.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: e.color }}
            />
            <span className="text-zinc-300 text-xs">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}