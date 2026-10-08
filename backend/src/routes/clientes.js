import { Router } from "express";
import { eq, sql, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import {
  ferCliente,
  ferDireccion,
  ferDepartamento,
  ferMunicipio,
} from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(
  requireAuth,
  requireRole("ADMINISTRADOR", "SUPERVISOR", "OPERADOR")
);

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v));

const createSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(180),
    nit: z.string().trim().min(1, "El NIT es obligatorio").max(20),
    telefono: optionalText(30),
    correo: z
      .string()
      .trim()
      .max(254)
      .optional()
      .superRefine((val, ctx) => {
        if (val == null || val === "") return;
        const check = z.string().email().safeParse(val);
        if (!check.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Correo inválido",
          });
        }
      })
      .transform((v) => (v === "" || v == null ? undefined : v.toLowerCase())),
    idMunicipio: z
      .union([z.number().int().positive(), z.string(), z.null(), z.undefined()])
      .optional()
      .transform((v) => {
        if (v == null || v === "") return undefined;
        const n = Number(v);
        return Number.isInteger(n) && n > 0 ? n : undefined;
      }),
    zona: optionalText(10),
    colonia: optionalText(120),
    calle: optionalText(120),
    avenida: optionalText(120),
    numeroCasa: optionalText(30),
    referencia: optionalText(300),
  })
  .superRefine((data, ctx) => {
    const tieneDetalle = Boolean(
      data.zona ||
        data.colonia ||
        data.calle ||
        data.avenida ||
        data.numeroCasa ||
        data.referencia
    );
    if (tieneDetalle && !data.idMunicipio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idMunicipio"],
        message: "Seleccione un municipio para la dirección",
      });
    }
  });

function fieldErrorsFromZod(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

function splitNombre(nombre) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { primerNombre: "", primerApellido: "" };
  }
  if (parts.length === 1) {
    return { primerNombre: parts[0], primerApellido: parts[0] };
  }
  return {
    primerNombre: parts[0],
    primerApellido: parts.slice(1).join(" ").slice(0, 60),
  };
}

function nombreCompleto(cliente) {
  if (cliente.tipoPersona === "JURIDICA" && cliente.razonSocial) {
    return cliente.razonSocial;
  }
  if (
    cliente.primerNombre === cliente.primerApellido ||
    !cliente.primerApellido
  ) {
    return cliente.primerNombre || "";
  }
  return `${cliente.primerNombre} ${cliente.primerApellido}`.trim();
}

function textoDireccion(dir, municipio, departamento) {
  if (!dir) return null;
  const partes = [];
  if (dir.calle) partes.push(dir.calle);
  if (dir.avenida) partes.push(dir.avenida);
  if (dir.numeroCasa) partes.push(`No. ${dir.numeroCasa}`);
  if (dir.zona) partes.push(`Zona ${dir.zona}`);
  if (dir.colonia) partes.push(dir.colonia);
  if (dir.referencia) partes.push(dir.referencia);
  if (municipio?.nombre) partes.push(municipio.nombre);
  if (departamento?.nombre) partes.push(departamento.nombre);
  return partes.length ? partes.join(", ") : null;
}

function normalizarNit(nit) {
  return nit.trim().toUpperCase().replace(/\s+/g, "");
}

async function mapCliente(cliente) {
  let direccion = null;
  if (cliente.idDireccion) {
    const [dir] = await db
      .select()
      .from(ferDireccion)
      .where(eq(ferDireccion.id, cliente.idDireccion))
      .limit(1);

    let municipio = null;
    let departamento = null;
    if (dir) {
      [municipio] = await db
        .select()
        .from(ferMunicipio)
        .where(eq(ferMunicipio.id, dir.idMunicipio))
        .limit(1);
      if (municipio) {
        [departamento] = await db
          .select()
          .from(ferDepartamento)
          .where(eq(ferDepartamento.id, municipio.idDepartamento))
          .limit(1);
      }
    }
    direccion = textoDireccion(dir, municipio, departamento);
  }

  return {
    id: cliente.id,
    nombre: nombreCompleto(cliente),
    nit: cliente.nit,
    correo: cliente.correo,
    telefono: cliente.telefono,
    direccion,
    estado: cliente.estado,
    activo: cliente.estado === "A",
    fechaCreacion: cliente.fechaCreacion,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const clientes = await db
      .select()
      .from(ferCliente)
      .orderBy(asc(ferCliente.id));

    const data = [];
    for (const c of clientes) {
      data.push(await mapCliente(c));
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Revise los campos obligatorios",
        fields: fieldErrorsFromZod(parsed.error),
      });
    }

    const {
      nombre,
      nit,
      telefono,
      correo,
      idMunicipio,
      zona,
      colonia,
      calle,
      avenida,
      numeroCasa,
      referencia,
    } = parsed.data;
    const nitNorm = normalizarNit(nit);

    const [nitExiste] = await db
      .select({ id: ferCliente.id })
      .from(ferCliente)
      .where(sql`UPPER(REPLACE(${ferCliente.nit}, ' ', '')) = ${nitNorm}`)
      .limit(1);

    if (nitExiste) {
      return res.status(409).json({
        success: false,
        code: "NIT_DUPLICADO",
        message: "Ya existe un cliente con ese NIT",
        fields: { nit: "Ya existe un cliente con ese NIT" },
      });
    }

    const { primerNombre, primerApellido } = splitNombre(nombre);

    let idDireccion = null;
    if (idMunicipio) {
      const [mun] = await db
        .select({ id: ferMunicipio.id })
        .from(ferMunicipio)
        .where(eq(ferMunicipio.id, idMunicipio))
        .limit(1);

      if (!mun) {
        return res.status(400).json({
          success: false,
          message: "El municipio seleccionado no existe",
          fields: { idMunicipio: "Seleccione un municipio válido" },
        });
      }

      const [dir] = await db
        .insert(ferDireccion)
        .values({
          idMunicipio,
          zona: zona ?? null,
          colonia: colonia ?? null,
          calle: calle ?? null,
          avenida: avenida ?? null,
          numeroCasa: numeroCasa ?? null,
          referencia: referencia ?? null,
        })
        .returning();
      idDireccion = dir.id;
    }

    const [creado] = await db
      .insert(ferCliente)
      .values({
        idDireccion,
        tipoPersona: "INDIVIDUAL",
        nit: nitNorm.slice(0, 20),
        primerNombre: primerNombre.slice(0, 60),
        primerApellido: primerApellido.slice(0, 60),
        correo: correo ?? null,
        telefono: telefono ?? null,
        estado: "A",
      })
      .returning();

    res.status(201).json({
      success: true,
      data: await mapCliente(creado),
      message: "Cliente registrado correctamente",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
