import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "asistentes_sesion";

/** Longitud mínima: una clave larga hace inviable adivinarla por fuerza bruta. */
const MIN_KEY_LENGTH = 20;

/** ADMIN_KEY si está configurada y es suficientemente fuerte; si no, undefined (acceso cerrado). */
export function getAdminKey() {
  const key = process.env.ADMIN_KEY;
  if (key && key.length < MIN_KEY_LENGTH) {
    console.error(`ADMIN_KEY debe tener al menos ${MIN_KEY_LENGTH} caracteres; /asistentes queda bloqueada.`);
    return undefined;
  }
  return key;
}

/** Token de sesión derivado de ADMIN_KEY: cambiar la clave invalida las sesiones. */
export function sessionToken(adminKey: string) {
  return createHmac("sha256", adminKey).update("asistentes-sesion").digest("hex");
}

/** Compara dos textos en tiempo constante. */
export function safeEqual(given: string | undefined, expected: string) {
  if (given === undefined) return false;
  const a = createHmac("sha256", "cmp").update(given).digest();
  const b = createHmac("sha256", "cmp").update(expected).digest();
  return timingSafeEqual(a, b);
}
