import { Router } from "express";
import { db, schema } from "@workspace/db";
import { broadcast } from "../lib/pusher.js";

const router = Router();

router.get("/", async (_req, res) => {
  try { res.json(await db.select().from(schema.transactions)); }
  catch { res.status(500).json({ error: "Failed to fetch transactions" }); }
});

router.post("/", async (req, res) => {
  try {
    const [created] = await db.insert(schema.transactions).values(req.body).returning();
    await broadcast("transactions", "created", created);
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Failed to create transaction" }); }
});

export default router;
