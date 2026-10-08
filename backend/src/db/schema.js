import {
  pgTable,
  bigint,
  varchar,
  char,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Esquema alineado al script SQL oficial (tablas FER_*).
 * Solo se mapean las tablas necesarias para autenticación (HU1).
 */

export const ferUsuario = pgTable("FER_USUARIO", {
  id: bigint("USU_ID_USUARIO", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  idDireccion: bigint("USU_ID_DIRECCION", { mode: "number" }),
  primerNombre: varchar("USU_PRIMER_NOMBRE", { length: 60 }).notNull(),
  segundoNombre: varchar("USU_SEGUNDO_NOMBRE", { length: 60 }),
  tercerNombre: varchar("USU_TERCER_NOMBRE", { length: 60 }),
  primerApellido: varchar("USU_PRIMER_APELLIDO", { length: 60 }).notNull(),
  segundoApellido: varchar("USU_SEGUNDO_APELLIDO", { length: 60 }),
  nombreUsuario: varchar("USU_NOMBRE_USUARIO", { length: 60 }).notNull(),
  correo: varchar("USU_CORREO", { length: 254 }).notNull(),
  telefono: varchar("USU_TELEFONO", { length: 30 }),
  claveHash: varchar("USU_CLAVE_HASH", { length: 255 }).notNull(),
  estado: char("USU_ESTADO", { length: 1 }).notNull().default("A"),
  intentosFallidos: integer("USU_INTENTOS_FALLIDOS").notNull().default(0),
  fechaBloqueo: timestamp("USU_FECHA_BLOQUEO", { withTimezone: true }),
  ultimoAcceso: timestamp("USU_ULTIMO_ACCESO", { withTimezone: true }),
  fechaCreacion: timestamp("USU_FECHA_CREACION", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  fechaModificacion: timestamp("USU_FECHA_MODIFICACION", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const ferRol = pgTable("FER_ROL", {
  id: bigint("ROL_ID_ROL", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  nombre: varchar("ROL_NOMBRE", { length: 60 }).notNull(),
  descripcion: varchar("ROL_DESCRIPCION", { length: 250 }).notNull(),
  estado: char("ROL_ESTADO", { length: 1 }).notNull().default("A"),
});

export const ferUsuarioRol = pgTable("FER_USUARIO_ROL", {
  id: bigint("URO_ID_USUARIO_ROL", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  idUsuario: bigint("URO_ID_USUARIO", { mode: "number" }).notNull(),
  idRol: bigint("URO_ID_ROL", { mode: "number" }).notNull(),
  fechaAsignacion: timestamp("URO_FECHA_ASIGNACION", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  fechaRevocacion: timestamp("URO_FECHA_REVOCACION", { withTimezone: true }),
  estado: char("URO_ESTADO", { length: 1 }).notNull().default("A"),
});
