import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Esquema base para Distribuidora Nova.
 * Ampliar según el análisis de requisitos (productos, ventas, inventario, etc.).
 */

export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
  descripcion: text("descripcion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  descripcion: text("descripcion"),
  categoriaId: integer("categoria_id").references(() => categorias.id),
  precio: numeric("precio", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  stockMinimo: integer("stock_minimo").notNull().default(5),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  nit: varchar("nit", { length: 30 }),
  telefono: varchar("telefono", { length: 30 }),
  email: varchar("email", { length: 150 }),
  direccion: text("direccion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
