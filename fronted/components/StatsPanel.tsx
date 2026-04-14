"use client";

interface Stats {
  totalChunks: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  lastScan: string;
}

export function StatsPanel({ stats }: { stats: Stats }) {
  const { totalChunks, bounds, lastScan } = stats;
  const exploredArea = (
    (bounds.maxX - bounds.minX + 1) *
    (bounds.maxZ - bounds.minZ + 1) *
    16 *
    16
  ).toLocaleString();

  return (
    <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-2 text-xs space-y-1">
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Chunks</span>
        <span className="text-white font-mono">{totalChunks.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Area</span>
        <span className="text-white font-mono">{exploredArea} blocks²</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">X range</span>
        <span className="text-white font-mono">
          {bounds.minX * 16} → {bounds.maxX * 16}
        </span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-zinc-400">Z range</span>
        <span className="text-white font-mono">
          {bounds.minZ * 16} → {bounds.maxZ * 16}
        </span>
      </div>
      <div className="flex justify-between gap-6 pt-1 border-t border-zinc-800">
        <span className="text-zinc-500">Last scan</span>
        <span className="text-zinc-400 font-mono">
          {new Date(lastScan).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}