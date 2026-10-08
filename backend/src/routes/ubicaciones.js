import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { ferDepartamento, ferMunicipio } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(
  requireAuth,
  requireRole("ADMINISTRADOR", "SUPERVISOR", "OPERADOR")
);

router.get("/departamentos", async (_req, res, next) => {
  try {
    const data = await db
      .select({
        id: ferDepartamento.id,
        codigo: ferDepartamento.codigo,
        nombre: ferDepartamento.nombre,
      })
      .from(ferDepartamento)
      .orderBy(asc(ferDepartamento.codigo));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/municipios", async (req, res, next) => {
  try {
    const idDepartamento = Number(req.query.departamentoId);
    if (!Number.isInteger(idDepartamento) || idDepartamento <= 0) {
      return res.status(400).json({
        success: false,
        message: "Indique un departamento válido",
      });
    }

    const data = await db
      .select({
        id: ferMunicipio.id,
        codigo: ferMunicipio.codigo,
        nombre: ferMunicipio.nombre,
        idDepartamento: ferMunicipio.idDepartamento,
      })
      .from(ferMunicipio)
      .where(eq(ferMunicipio.idDepartamento, idDepartamento))
      .orderBy(asc(ferMunicipio.nombre));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
