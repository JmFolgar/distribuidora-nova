import "../backend/src/loadEnv.js";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db, pool } from "../backend/src/db/index.js";
import {
  ferUsuario,
  ferRol,
  ferUsuarioRol,
} from "../backend/src/db/schema.js";

/**
 * Seeder de usuarios de prueba (login / QA).
 * Uso: npm run db:seed
 */
const USUARIOS = [
  {
    primerNombre: "Jorge",
    primerApellido: "Folgar",
    nombreUsuario: "jfolgar",
    correo: "jfolgar@gmail.com",
    contrasena: "Admin123!",
    rol: "ADMINISTRADOR",
    estado: "A",
  },
  {
    primerNombre: "Luis",
    primerApellido: "Guevara",
    nombreUsuario: "lguevara",
    correo: "lguevara@gmail.com",
    contrasena: "Super123!",
    rol: "SUPERVISOR",
    estado: "A",
  },
  {
    primerNombre: "Pablo",
    primerApellido: "Quan",
    nombreUsuario: "pquan",
    correo: "pquan@gmail.com",
    contrasena: "Opera123!",
    rol: "OPERADOR",
    estado: "A",
  },
  {
    primerNombre: "Prueba",
    primerApellido: "Inactivo",
    nombreUsuario: "pinactivo",
    correo: "pinactivo@gmail.com",
    contrasena: "Inactivo123!",
    rol: "OPERADOR",
    estado: "I",
  },
];

async function seedUsuarios() {
  console.log("🌱 Seeder usuarios — insertando datos de prueba…");

  for (const u of USUARIOS) {
    const [rol] = await db
      .select()
      .from(ferRol)
      .where(eq(ferRol.nombre, u.rol))
      .limit(1);

    if (!rol) {
      throw new Error(
        `Rol ${u.rol} no existe. Ejecute primero SQL/Scripts/FERRETERIA_POSTGRESQL.sql`
      );
    }

    const [existente] = await db
      .select()
      .from(ferUsuario)
      .where(sql`LOWER(${ferUsuario.correo}) = ${u.correo.toLowerCase()}`)
      .limit(1);

    let usuarioId = existente?.id;

    if (!existente) {
      const hash = await bcrypt.hash(u.contrasena, 10);
      const [creado] = await db
        .insert(ferUsuario)
        .values({
          primerNombre: u.primerNombre,
          primerApellido: u.primerApellido,
          nombreUsuario: u.nombreUsuario,
          correo: u.correo.toLowerCase(),
          claveHash: hash,
          estado: u.estado,
        })
        .returning({ id: ferUsuario.id });
      usuarioId = creado.id;
      console.log(`  + Usuario ${u.correo} (${u.estado})`);
    } else {
      const hash = await bcrypt.hash(u.contrasena, 10);
      await db
        .update(ferUsuario)
        .set({
          primerNombre: u.primerNombre,
          primerApellido: u.primerApellido,
          nombreUsuario: u.nombreUsuario,
          claveHash: hash,
          estado: u.estado,
          fechaModificacion: new Date(),
        })
        .where(eq(ferUsuario.id, existente.id));
      console.log(`  · Usuario ${u.correo} actualizado`);
    }

    const [asignacion] = await db
      .select()
      .from(ferUsuarioRol)
      .where(
        sql`${ferUsuarioRol.idUsuario} = ${usuarioId} AND ${ferUsuarioRol.idRol} = ${rol.id}`
      )
      .limit(1);

    if (!asignacion) {
      await db.insert(ferUsuarioRol).values({
        idUsuario: usuarioId,
        idRol: rol.id,
        estado: "A",
      });
      console.log(`    → Rol ${u.rol} asignado`);
    }
  }

  console.log("\n✅ Seeder usuarios completado. Credenciales de prueba:");
  console.log("   jfolgar@gmail.com   / Admin123!     (ADMINISTRADOR)");
  console.log("   lguevara@gmail.com  / Super123!     (SUPERVISOR)");
  console.log("   pquan@gmail.com     / Opera123!     (OPERADOR)");
  console.log("   pinactivo@gmail.com / Inactivo123!  (INACTIVO)");

  await pool.end();
}

seedUsuarios().catch(async (err) => {
  console.error("❌ Error en seeder usuarios:", err);
  await pool.end();
  process.exit(1);
});
