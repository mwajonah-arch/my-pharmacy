import { Router } from "express";
import { db, schema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { broadcast } from "../lib/pusher.js";

const router = Router();

router.get("/", async (_req, res) => {
  try { res.json(await db.select().from(schema.stockUpdates)); }
  catch { res.status(500).json({ error: "Failed to fetch stock updates" }); }
});

router.post("/", async (req, res) => {
  try {
    const [created] = await db.insert(schema.stockUpdates).values(req.body).returning();
    await broadcast("stock-updates", "created", created);
    await broadcast("products", "updated", { id: created.productId });
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Failed to create stock update" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db.update(schema.stockUpdates)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schema.stockUpdates.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Stock update not found" });
    await broadcast("stock-updates", "updated", updated);
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update stock update" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(schema.stockUpdates).where(eq(schema.stockUpdates.id, id));
    await broadcast("stock-updates", "deleted", { id });
    res.status(204).send();
  } catch { res.status(500).json({ error: "Failed to delete stock update" }); }
});

export default router;
