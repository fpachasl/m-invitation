import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { rsvps } from "@/db/schema";
import { login } from "./actions";
import { AUTH_COOKIE, safeEqual, sessionToken } from "./auth";

export const metadata: Metadata = {
  title: "Asistentes · 60 años",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Lima",
});

export default async function AsistentesPage({ searchParams }: PageProps<"/asistentes">) {
  const { error } = await searchParams;
  const adminKey = process.env.ADMIN_KEY;

  // En producción la lista es privada: sin ADMIN_KEY configurada no se muestra.
  if (!adminKey && process.env.NODE_ENV === "production") notFound();

  const session = (await cookies()).get(AUTH_COOKIE)?.value;
  if (adminKey && !safeEqual(session, sessionToken(adminKey))) {
    return (
      <Shell>
        <form action={login} className="mx-auto mt-10 flex max-w-xs flex-col gap-3 text-center">
          <label htmlFor="clave" className="text-xs font-bold uppercase tracking-[0.3em]">
            Clave de acceso
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoFocus
            className="rounded-full border-2 border-ink/80 bg-white/50 px-5 py-2.5 text-center outline-none focus:border-ink"
          />
          {error !== undefined && <p className="text-sm text-red-800">Clave incorrecta</p>}
          <button className="cursor-pointer rounded-full border-2 border-ink bg-ink py-2.5 text-sm font-bold uppercase tracking-[0.3em] text-[#ececec]">
            Entrar
          </button>
        </form>
      </Shell>
    );
  }

  await ensureSchema();
  const rows = await db.select().from(rsvps).orderBy(desc(rsvps.updatedAt));

  const going = rows.filter((r) => r.attending);
  const notGoing = rows.filter((r) => !r.attending);
  const totalGuests = going.reduce((sum, r) => sum + r.guests, 0);

  return (
    <Shell>
      <section className="mt-8 grid grid-cols-3 divide-x divide-ink/70 text-center">
        <Stat label="Asistentes" value={totalGuests} big />
        <Stat label="Sí irán" value={going.length} />
        <Stat label="No irán" value={notGoing.length} />
      </section>

      <List title="Sí irán" empty="Aún no hay confirmaciones.">
        {going.map((r) => (
          <Row key={r.id} name={r.name} detail={`${r.guests} ${r.guests === 1 ? "persona" : "personas"}`} message={r.message} date={r.updatedAt} />
        ))}
      </List>

      <List title="No irán" empty="Nadie ha declinado.">
        {notGoing.map((r) => (
          <Row key={r.id} name={r.name} message={r.message} date={r.updatedAt} />
        ))}
      </List>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh justify-center px-4 py-10">
      <div className="silver-card w-full max-w-2xl self-start p-[6px]">
        <div className="relative border-[3px] border-ink px-5 py-9 sm:px-10">
          <div className="pointer-events-none absolute inset-[4px] border border-ink/80" aria-hidden />
          <p className="text-center text-xs font-bold uppercase tracking-[0.35em]">Mis</p>
          <h1 className="text-center font-display text-7xl font-medium leading-none [font-variant-numeric:lining-nums] [font-variation-settings:'opsz'_72]">60</h1>
          <p className="mt-1 text-center text-2xl uppercase tracking-[0.3em]">Años</p>
          <p className="mt-3 text-center font-script text-3xl">Lista de asistentes</p>
          {children}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, big = false }: { label: string; value: number; big?: boolean }) {
  return (
    <div className="px-2">
      <p className={`font-serif leading-none ${big ? "text-6xl" : "text-5xl"}`}>{value}</p>
      <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] sm:text-xs">{label}</p>
    </div>
  );
}

function List({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em]">{title}</h2>
        <span className="h-px flex-1 bg-ink" />
      </div>
      {children.length ? (
        <ul className="mt-3 divide-y divide-ink/25">{children}</ul>
      ) : (
        <p className="mt-4 text-center text-sm text-ink/70">{empty}</p>
      )}
    </section>
  );
}

function Row({ name, detail, message, date }: { name: string; detail?: string; message: string | null; date: Date }) {
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-bold uppercase tracking-[0.12em]">{name}</p>
        {detail && <p className="shrink-0 text-sm font-bold uppercase tracking-[0.12em]">{detail}</p>}
      </div>
      {message && <p className="mt-1 font-script text-2xl leading-snug">“{message}”</p>}
      <p className="mt-0.5 text-xs text-ink/60">{dateFormat.format(date)}</p>
    </li>
  );
}
