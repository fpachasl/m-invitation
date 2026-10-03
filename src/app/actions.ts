"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, ensureSchema } from "@/db";
import { rsvps } from "@/db/schema";
import { EVENT } from "@/lib/event";

export type RsvpState =
  | { status: "idle" }
  | { status: "success"; attending: boolean; name: string; guests: number }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<"name" | "guests", string>> };

const rsvpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre")
    .max(80, "Nombre demasiado largo"),
  attending: z.enum(["si", "no"]),
  guests: z.coerce
    .number()
    .int()
    .min(1, "Mínimo 1 persona")
    .max(EVENT.maxGuests, `Máximo ${EVENT.maxGuests} personas`)
    .optional(),
  message: z.string().trim().max(300, "Mensaje demasiado largo").optional(),
  deviceId: z.string().trim().min(8).max(64),
});

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const parsed = rsvpSchema.safeParse({
    name: formData.get("name") ?? "",
    attending: formData.get("attending"),
    guests: formData.get("guests") || undefined,
    message: formData.get("message") || undefined,
    deviceId: formData.get("deviceId") ?? "",
  });

  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: "Revisa los datos del formulario",
      fieldErrors: { name: fields.name?.[0], guests: fields.guests?.[0] },
    };
  }

  const { name, attending, guests, message, deviceId } = parsed.data;
  const isAttending = attending === "si";
  const total = isAttending ? (guests ?? 1) : 0;

  try {
    await ensureSchema();
    const nameKey = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, " ").toLowerCase();
    const values = { name, attending: isAttending, guests: total, message: message ?? null };
    // Si este navegador ya respondió con el mismo nombre, se actualiza en lugar de duplicar.
    await db
      .insert(rsvps)
      .values({ ...values, nameKey, deviceId })
      .onConflictDoUpdate({
        target: [rsvps.deviceId, rsvps.nameKey],
        // Conserva el mensaje anterior si la nueva respuesta no trae uno.
        set: { ...values, message: sql`coalesce(excluded.message, ${rsvps.message})`, updatedAt: sql`(unixepoch())` },
      });
  } catch (error) {
    console.error("No se pudo guardar la confirmación", error);
    return { status: "error", message: "No pudimos guardar tu respuesta. Inténtalo de nuevo." };
  }

  revalidatePath("/asistentes");
  return { status: "success", attending: isAttending, name, guests: total };
}
