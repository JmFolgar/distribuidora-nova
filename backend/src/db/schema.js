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
 * Se mapean las tablas usadas por las HU implementadas.
 */

export const ferDepartamento = pgTable("FER_DEPARTAMENTO", {
  id: bigint("DEP_ID_DEPARTAMENTO", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  codigo: varchar("DEP_CODIGO", { length: 10 }).notNull(),
  nombre: varchar("DEP_NOMBRE", { length: 100 }).notNull(),
});

export const ferMunicipio = pgTable("FER_MUNICIPIO", {
  id: bigint("MUN_ID_MUNICIPIO", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  idDepartamento: bigint("MUN_ID_DEPARTAMENTO", { mode: "number" }).notNull(),
  codigo: varchar("MUN_CODIGO", { length: 10 }).notNull(),
  nombre: varchar("MUN_NOMBRE", { length: 100 }).notNull(),
});

export const ferDireccion = pgTable("FER_DIRECCION", {
  id: bigint("DIR_ID_DIRECCION", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  idMunicipio: bigint("DIR_ID_MUNICIPIO", { mode: "number" }).notNull(),
  zona: varchar("DIR_ZONA", { length: 10 }),
  colonia: varchar("DIR_COLONIA", { length: 120 }),
  calle: varchar("DIR_CALLE", { length: 120 }),
  avenida: varchar("DIR_AVENIDA", { length: 120 }),
  numeroCasa: varchar("DIR_NUMERO_CASA", { length: 30 }),
  referencia: varchar("DIR_REFERENCIA", { length: 300 }),
});

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

export const ferCliente = pgTable("FER_CLIENTE", {
  id: bigint("CLI_ID_CLIENTE", { mode: "number" })
    .generatedByDefaultAsIdentity()
    .primaryKey(),
  idDireccion: bigint("CLI_ID_DIRECCION", { mode: "number" }),
  tipoPersona: varchar("CLI_TIPO_PERSONA", { length: 10 }).notNull(),
  nit: varchar("CLI_NIT", { length: 20 }),
  primerNombre: varchar("CLI_PRIMER_NOMBRE", { length: 60 }),
  segundoNombre: varchar("CLI_SEGUNDO_NOMBRE", { length: 60 }),
  tercerNombre: varchar("CLI_TERCER_NOMBRE", { length: 60 }),
  primerApellido: varchar("CLI_PRIMER_APELLIDO", { length: 60 }),
  segundoApellido: varchar("CLI_SEGUNDO_APELLIDO", { length: 60 }),
  razonSocial: varchar("CLI_RAZON_SOCIAL", { length: 180 }),
  correo: varchar("CLI_CORREO", { length: 254 }),
  telefono: varchar("CLI_TELEFONO", { length: 30 }),
  estado: char("CLI_ESTADO", { length: 1 }).notNull().default("A"),
  fechaCreacion: timestamp("CLI_FECHA_CREACION", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
