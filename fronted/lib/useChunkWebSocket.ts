import { useEffect, useRef } from "react";

export function useChunkWebSocket(api: string, onUpdate: () => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = api.replace(/^http/, "ws") + "/ws";

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "update") {
            onUpdate();
          }
        } catch {}
      };

      ws.onclose = () => {
        // Reconnect after 5s
        setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [api, onUpdate]);
}