import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Pusher, { type Channel } from "pusher-js";

export type SyncEntity =
  | "products"
  | "sales"
  | "stock-updates"
  | "transactions"
  | "activity-log";

export type SyncEvent = "created" | "updated" | "deleted";

export interface SyncPayload {
  entity: SyncEntity;
  event: SyncEvent;
  data: unknown;
  timestamp: number;
}

const ALL_ENTITIES: SyncEntity[] = [
  "products",
  "sales",
  "stock-updates",
  "transactions",
  "activity-log",
];

let _pusher: Pusher | null = null;

function getPusher(): Pusher {
  if (!_pusher) {
    const key = import.meta.env.VITE_PUSHER_KEY as string;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER as string;
    if (!key || !cluster) throw new Error("Set VITE_PUSHER_KEY and VITE_PUSHER_CLUSTER in .env");
    _pusher = new Pusher(key, { cluster, forceTLS: true });
  }
  return _pusher;
}

/**
 * Subscribe to real-time sync events and auto-invalidate React Query cache.
 *
 * @example
 * useRealtimeSync(["products", "sales"]); // watch specific entities
 * useRealtimeSync();                       // watch everything
 */
export function useRealtimeSync(entities: SyncEntity[] = ALL_ENTITIES): void {
  const queryClient = useQueryClient();
  const entitiesRef = useRef(entities);
  entitiesRef.current = entities;

  useEffect(() => {
    const pusher = getPusher();
    const channel: Channel = pusher.subscribe("medhub-sync");
    const handlers = new Map<string, (p: SyncPayload) => void>();

    for (const entity of entitiesRef.current) {
      for (const event of ["created", "updated", "deleted"] as SyncEvent[]) {
        const name = `${entity}:${event}`;
        const handler = (payload: SyncPayload) => {
          queryClient.invalidateQueries({ queryKey: [payload.entity] });
        };
        handlers.set(name, handler);
        channel.bind(name, handler);
      }
    }

    return () => {
      handlers.forEach((handler, name) => channel.unbind(name, handler));
      pusher.unsubscribe("medhub-sync");
    };
  }, [queryClient]);
}
