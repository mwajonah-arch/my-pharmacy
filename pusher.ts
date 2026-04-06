import Pusher from "pusher";

const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;

if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
  throw new Error("Missing Pusher env vars: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER");
}

export const pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

export type SyncEntity = "products" | "sales" | "stock-updates" | "transactions" | "activity-log";
export type SyncEvent = "created" | "updated" | "deleted";

export async function broadcast(entity: SyncEntity, event: SyncEvent, data: unknown): Promise<void> {
  await pusher.trigger("medhub-sync", `${entity}:${event}`, {
    entity, event, data, timestamp: Date.now(),
  });
}
