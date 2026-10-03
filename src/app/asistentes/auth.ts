import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "asistentes_sesion";

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
