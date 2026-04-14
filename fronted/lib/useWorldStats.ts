import { useEffect, useState, useCallback } from "react";

interface Stats {
  totalChunks: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  lastScan: string;
}

export function useWorldStats(api: string) {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useCallback(() => {
    fetch(`${api}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, [api]);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  return stats;
}