import { Router } from "express";
import { db, schema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { broadcast } from "../lib/pusher.js";

const router = Router();

router.get("/", async (_req, res) => {
  try { res.json(await db.select().from(schema.products)); }
  catch { res.status(500).json({ error: "Failed to fetch products" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(schema.products).where(eq(schema.products.id, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  } catch { res.status(500).json({ error: "Failed to fetch product" }); }
});

router.post("/", async (req, res) => {
  try {
    const [created] = await db.insert(schema.products).values(req.body).returning();
    await broadcast("products", "created", created);
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Failed to create product" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db.update(schema.products)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schema.products.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Product not found" });
    await broadcast("products", "updated", updated);
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update product" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(schema.products).where(eq(schema.products.id, id));
    await broadcast("products", "deleted", { id });
    res.status(204).send();
  } catch { res.status(500).json({ error: "Failed to delete product" }); }
});

export default router;
