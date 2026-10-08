import "../backend/src/loadEnv.js";
import { eq, or } from "drizzle-orm";
import { db, pool } from "../backend/src/db/index.js";
import {
  ferDepartamento,
  ferMunicipio,
} from "../backend/src/db/schema.js";
import { DEPARTAMENTOS } from "./data/ubicaciones-gt.js";

/**
 * Seeder de departamentos y municipios (ubicaciones normalizadas).
 * Uso: npm run db:seed:ubicaciones
 */
async function upsertDepartamento(codigo, nombre) {
  const [porCodigo] = await db
    .select()
    .from(ferDepartamento)
    .where(eq(ferDepartamento.codigo, codigo))
    .limit(1);

  if (porCodigo) {
    if (porCodigo.nombre !== nombre) {
      await db
        .update(ferDepartamento)
        .set({ nombre })
        .where(eq(ferDepartamento.id, porCodigo.id));
    }
    return { row: porCodigo, created: false };
  }

  const [porNombre] = await db
    .select()
    .from(ferDepartamento)
    .where(eq(ferDepartamento.nombre, nombre))
    .limit(1);

  if (porNombre) {
    await db
      .update(ferDepartamento)
      .set({ codigo })
      .where(eq(ferDepartamento.id, porNombre.id));
    return { row: { ...porNombre, codigo }, created: false };
  }

  const [creado] = await db
    .insert(ferDepartamento)
    .values({ codigo, nombre })
    .returning();
  return { row: creado, created: true };
}

async function upsertMunicipio(idDepartamento, codigo, nombre) {
  const [porCodigo] = await db
    .select()
    .from(ferMunicipio)
    .where(eq(ferMunicipio.codigo, codigo))
    .limit(1);

  if (porCodigo) {
    if (
      porCodigo.nombre !== nombre ||
      porCodigo.idDepartamento !== idDepartamento
    ) {
      await db
        .update(ferMunicipio)
        .set({ nombre, idDepartamento })
        .where(eq(ferMunicipio.id, porCodigo.id));
    }
    return false;
  }

  // Compatibilidad con el municipio provisional GUA-01 → Guatemala (0101)
  if (codigo === "0101") {
    const [legacy] = await db
      .select()
      .from(ferMunicipio)
      .where(
        or(
          eq(ferMunicipio.codigo, "GUA-01"),
          eq(ferMunicipio.nombre, "Ciudad de Guatemala"),
          eq(ferMunicipio.nombre, "Guatemala")
        )
      )
      .limit(1);

    if (legacy) {
      await db
        .update(ferMunicipio)
        .set({ codigo, nombre, idDepartamento })
        .where(eq(ferMunicipio.id, legacy.id));
      return false;
    }
  }

  const [porNombre] = await db
    .select()
    .from(ferMunicipio)
    .where(eq(ferMunicipio.nombre, nombre))
    .limit(1);

  if (porNombre && porNombre.idDepartamento === idDepartamento) {
    await db
      .update(ferMunicipio)
      .set({ codigo })
      .where(eq(ferMunicipio.id, porNombre.id));
    return false;
  }

  await db.insert(ferMunicipio).values({
    idDepartamento,
    codigo,
    nombre,
  });
  return true;
}

async function seed() {
  console.log("📍 Seeding ubicaciones (departamentos / municipios)…");

  let depsCreados = 0;
  let munsCreados = 0;

  for (const dep of DEPARTAMENTOS) {
    const { row, created } = await upsertDepartamento(dep.codigo, dep.nombre);
    if (created) depsCreados += 1;

    for (const [codigo, nombre] of dep.municipios) {
      const createdMun = await upsertMunicipio(row.id, codigo, nombre);
      if (createdMun) munsCreados += 1;
    }
  }

  console.log(
    `   Departamentos nuevos: ${depsCreados} · Municipios nuevos: ${munsCreados}`
  );
  console.log("✅ Ubicaciones listas.");
}

seed()
  .catch((err) => {
    console.error("❌ Error en seed de ubicaciones:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
