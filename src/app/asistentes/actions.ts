"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getAdminKey, safeEqual, sessionToken } from "./auth";

export async function login(formData: FormData) {
  const adminKey = getAdminKey();
  const clave = formData.get("clave");

  if (!adminKey || typeof clave !== "string" || !safeEqual(clave, adminKey)) {
    redirect("/asistentes?error=1");
  }

  (await cookies()).set(AUTH_COOKIE, sessionToken(adminKey), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/asistentes",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/asistentes");
}
