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
 * Seeder de usuarios de prueba (HU1 — login).
 * Uso: npm run db:seed
 */
const USUARIOS = [
  {
    primerNombre: "Ana",
    primerApellido: "Administradora",
    nombreUsuario: "admin",
    correo: "admin@nova.com",
    contrasena: "Admin123!",
    rol: "ADMINISTRADOR",
    estado: "A",
  },
  {
    primerNombre: "Carlos",
    primerApellido: "Supervisor",
    nombreUsuario: "supervisor",
    correo: "supervisor@nova.com",
    contrasena: "Super123!",
    rol: "SUPERVISOR",
    estado: "A",
  },
  {
    primerNombre: "Luis",
    primerApellido: "Operador",
    nombreUsuario: "operador",
    correo: "operador@nova.com",
    contrasena: "Opera123!",
    rol: "OPERADOR",
    estado: "A",
  },
  {
    primerNombre: "Maria",
    primerApellido: "Inactiva",
    nombreUsuario: "inactivo",
    correo: "inactivo@nova.com",
    contrasena: "Inactivo123!",
    rol: "OPERADOR",
    estado: "I",
  },
];

async function seedUsuarios() {
  console.log("🌱 Seeder usuarios — insertando datos de prueba (HU1)...");

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
      console.log(`  · Usuario ${u.correo} ya existe, se omite`);
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
  console.log("   admin@nova.com / Admin123!        (ADMINISTRADOR)");
  console.log("   supervisor@nova.com / Super123!   (SUPERVISOR)");
  console.log("   operador@nova.com / Opera123!     (OPERADOR)");
  console.log("   inactivo@nova.com / Inactivo123!  (INACTIVO)");

  await pool.end();
}

seedUsuarios().catch(async (err) => {
  console.error("❌ Error en seeder usuarios:", err);
  await pool.end();
  process.exit(1);
});
