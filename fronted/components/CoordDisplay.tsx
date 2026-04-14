"use client";

export function CoordDisplay({ x, z }: { x: number; z: number }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-1.5 font-mono text-xs text-zinc-300">
      X <span className="text-white">{x}</span>{" "}
      Z <span className="text-white">{z}</span>
      <span className="text-zinc-500 ml-2">
        (chunk {Math.floor(x / 16)}, {Math.floor(z / 16)})
      </span>
    </div>
  );
}