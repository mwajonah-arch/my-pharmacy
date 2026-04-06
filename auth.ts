import { Router } from "express";
const router = Router();
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    // TODO: verify credentials against your users table, sign JWT
    res.json({ message: "Wire up your auth logic here" });
  } catch { res.status(500).json({ error: "Auth error" }); }
});
router.post("/logout", (_req, res) => res.json({ message: "Logged out" }));
export default router;
