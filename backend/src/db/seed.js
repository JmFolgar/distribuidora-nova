import "../loadEnv.js";
import { db, pool } from "./index.js";
import { categorias, productos, clientes } from "./schema.js";

async function seed() {
  console.log("🌱 Insertando datos de prueba...");

  const [herramientas] = await db
    .insert(categorias)
    .values([
      { nombre: "Herramientas", descripcion: "Herramientas manuales y eléctricas" },
      { nombre: "Tornillería", descripcion: "Tornillos, tuercas y afines" },
      { nombre: "Pinturas", descripcion: "Pinturas y accesorios" },
    ])
    .returning();

  await db.insert(productos).values([
    {
      codigo: "HER-001",
      nombre: "Martillo 16 oz",
      descripcion: "Martillo de carpintero",
      categoriaId: herramientas.id,
      precio: "45.00",
      stock: 30,
      stockMinimo: 5,
    },
    {
      codigo: "HER-002",
      nombre: "Destornillador Phillips",
      descripcion: "Juego de destornilladores",
      categoriaId: herramientas.id,
      precio: "25.50",
      stock: 50,
      stockMinimo: 10,
    },
  ]);

  await db.insert(clientes).values([
    {
      nombre: "Cliente General",
      nit: "CF",
      telefono: "5555-0000",
      email: "cliente@ejemplo.com",
    },
  ]);

  console.log("✅ Seed completado");
  await pool.end();
}

seed().catch(async (err) => {
  console.error("❌ Error en seed:", err);
  await pool.end();
  process.exit(1);
});
