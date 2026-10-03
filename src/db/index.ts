import "server-only";
import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Local: SQLite en ./data/invitacion.db (no requiere configuración).
 * Vercel: el sistema de archivos no es persistente, así que se usa Turso
 * (libSQL, mismo motor SQLite) mediante TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.
 */
function databaseUrl() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return url;
  if (process.env.VERCEL) {
    throw new Error(
      "Falta TURSO_DATABASE_URL: en Vercel la base local no persiste. Revisa el README.",
    );
  }
  mkdirSync("data", { recursive: true });
  return "file:data/invitacion.db";
}

const client = createClient({
  url: databaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

let ready: Promise<unknown> | undefined;

/** Crea la tabla si no existe (sin pasos de migración manuales). */
export function ensureSchema() {
  ready ??= client
    .batch(
      [
        `CREATE TABLE IF NOT EXISTS rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          name_key TEXT NOT NULL,
          device_id TEXT NOT NULL,
          attending INTEGER NOT NULL,
          guests INTEGER NOT NULL DEFAULT 0,
          message TEXT,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS rsvps_device_name ON rsvps (device_id, name_key)`,
      ],
      "write",
    )
    .catch((error) => {
      ready = undefined;
      throw error;
    });
  return ready;
}
