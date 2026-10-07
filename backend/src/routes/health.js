import { Router } from "express";
import { pool } from "../db/index.js";

const router = Router();

router.get("/", async (_req, res) => {
  let database = "disconnected";

  try {
    await pool.query("SELECT 1");
    database = "connected";
  } catch {
    database = "disconnected";
  }

  res.json({
    success: true,
    service: "Distribuidora Nova API",
    status: "ok",
    database,
    timestamp: new Date().toISOString(),
  });
});

export default router;
