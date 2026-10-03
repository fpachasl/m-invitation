import "server-only";
import { mkdirSync } from "node:fs";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
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

let client: Client | undefined;
let database: LibSQLDatabase<typeof schema> | undefined;
let ready: Promise<unknown> | undefined;

/** Conexión creada en el primer uso, para que el build no dependa de la base de datos. */
function getClient() {
  client ??= createClient({
    url: databaseUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return client;
}

/** Crea la tabla si no existe (sin pasos de migración manuales). */
function ensureSchema() {
  ready ??= getClient()
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

/** Base de datos lista para usar (con la tabla creada). */
export async function getDb() {
  await ensureSchema();
  database ??= drizzle(getClient(), { schema });
  return database;
}
