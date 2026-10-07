import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { productos } from "../db/schema.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(productos).where(eq(productos.activo, true));
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(productos).where(eq(productos.id, id));

    if (!row) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

export default router;
