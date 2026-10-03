import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rsvps = sqliteTable(
  "rsvps",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    /** Nombre normalizado: evita duplicados si la misma persona responde dos veces. */
    nameKey: text("name_key").notNull(),
    /** Identificador anónimo del navegador que respondió. */
    deviceId: text("device_id").notNull(),
    attending: integer("attending", { mode: "boolean" }).notNull(),
    /** Personas que asistirán (incluye a quien confirma). 0 si no asiste. */
    guests: integer("guests").notNull().default(0),
    message: text("message"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("rsvps_device_name").on(t.deviceId, t.nameKey)],
);

export type Rsvp = typeof rsvps.$inferSelect;
