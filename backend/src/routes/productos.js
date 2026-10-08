import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Placeholder hasta la HU de productos.
 * Protegido: solo usuarios autenticados pueden consultar.
 */
router.get("/", requireAuth, (_req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Módulo de productos pendiente de implementación",
  });
});

export default router;
