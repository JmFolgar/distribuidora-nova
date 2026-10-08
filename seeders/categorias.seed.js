import "../backend/src/loadEnv.js";
import { eq } from "drizzle-orm";
import { db, pool } from "../backend/src/db/index.js";
import { ferCategoria } from "../backend/src/db/schema.js";

/**
 * Categorías base para ferretería / distribución (HU5).
 * Uso: npm run db:seed:categorias
 */
const CATEGORIAS = [
  {
    nombre: "Herramientas",
    descripcion: "Herramientas manuales y eléctricas",
  },
  {
    nombre: "Materiales de construcción",
    descripcion: "Cemento, varilla, bloques y afines",
  },
  {
    nombre: "Pinturas y acabados",
    descripcion: "Pinturas, solventes y accesorios",
  },
  {
    nombre: "Electricidad",
    descripcion: "Cables, interruptores y materiales eléctricos",
  },
  {
    nombre: "Plomería",
    descripcion: "Tubería, conexiones y grifería",
  },
  {
    nombre: "Fijaciones",
    descripcion: "Tornillos, clavos, anclajes y similares",
  },
  {
    nombre: "Seguridad industrial",
    descripcion: "EPP y artículos de seguridad",
  },
  {
    nombre: "Otros",
    descripcion: "Productos varios",
  },
];

async function seed() {
  console.log("📦 Seeding categorías…");
  let creadas = 0;

  for (const cat of CATEGORIAS) {
    const [existe] = await db
      .select({ id: ferCategoria.id })
      .from(ferCategoria)
      .where(eq(ferCategoria.nombre, cat.nombre))
      .limit(1);

    if (existe) {
      console.log(`  · ${cat.nombre} ya existe`);
      continue;
    }

    await db.insert(ferCategoria).values({
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      estado: "A",
    });
    creadas += 1;
    console.log(`  + ${cat.nombre}`);
  }

  console.log(`✅ Categorías listas (nuevas: ${creadas}).`);
}

seed()
  .catch((err) => {
    console.error("❌ Error en seed de categorías:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
