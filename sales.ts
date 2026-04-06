import { Router } from "express";
import { db, schema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { broadcast } from "../lib/pusher.js";

const router = Router();

router.get("/", async (_req, res) => {
  try { res.json(await db.select().from(schema.sales)); }
  catch { res.status(500).json({ error: "Failed to fetch sales" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(schema.sales).where(eq(schema.sales.id, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: "Sale not found" });
    res.json(row);
  } catch { res.status(500).json({ error: "Failed to fetch sale" }); }
});

router.post("/", async (req, res) => {
  try {
    const [created] = await db.insert(schema.sales).values(req.body).returning();
    await broadcast("sales", "created", created);
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Failed to create sale" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db.update(schema.sales)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schema.sales.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Sale not found" });
    await broadcast("sales", "updated", updated);
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update sale" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(schema.sales).where(eq(schema.sales.id, id));
    await broadcast("sales", "deleted", { id });
    res.status(204).send();
  } catch { res.status(500).json({ error: "Failed to delete sale" }); }
});

export default router;
