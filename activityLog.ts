import { Router } from "express";
import { db, schema } from "@workspace/db";
import { broadcast } from "../lib/pusher.js";

const router = Router();

router.get("/", async (_req, res) => {
  try { res.json(await db.select().from(schema.activityLog).orderBy(schema.activityLog.createdAt)); }
  catch { res.status(500).json({ error: "Failed to fetch activity log" }); }
});

router.post("/", async (req, res) => {
  try {
    const [created] = await db.insert(schema.activityLog).values(req.body).returning();
    await broadcast("activity-log", "created", created);
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Failed to create activity log entry" }); }
});

export default router;
