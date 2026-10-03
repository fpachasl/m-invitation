# Invitación 60 años

Invitación web hecha con Next.js 16 + Tailwind CSS 4, réplica del diseño
`design/Invitación de cumpleaños - Moderno, blanco, negro y rosa (9).png`.

- **Diseño**: el fondo (`public/invitacion-base.webp`) es el diseño original sin textos ni botones;
  los textos son HTML real colocados en las coordenadas exactas del diseño (`src/lib/layout.ts`).
- **Datos del evento**: edita `src/lib/event.ts` (edad, fecha, hora, dirección, vestimenta).
- **Confirmaciones (RSVP)**: los botones *Sí iré* / *No iré* abren un formulario que guarda nombre,
  cantidad de asistentes y mensaje opcional (Server Action + Drizzle ORM + SQLite/libSQL).
  Si la misma persona responde de nuevo desde el mismo navegador, se actualiza su respuesta (no se duplica).
- **Lista de asistentes**: `/asistentes` muestra el total de asistentes y la lista de respuestas
  (en local abre sin clave; en producción requiere `ADMIN_KEY`).

Librerías: `drizzle-orm`, `@libsql/client`, `zod`, `motion`, `sonner`.

## Desarrollo local

```bash
npm install
npm run dev
```

Sin configurar nada, la base de datos se crea en `data/invitacion.db` (SQLite local).
Para explorarla: `npm run db:studio`.

## Desplegar en Vercel

En Vercel el disco no es persistente, así que un archivo SQLite se perdería.
Se usa **Turso** (SQLite en la nube, mismo código, plan gratuito):

1. En Vercel → tu proyecto → *Storage* / *Marketplace* → agrega **Turso** (o crea la base en turso.tech).
2. Configura las variables de entorno:
   - `TURSO_DATABASE_URL` (ej. `libsql://invitacion-tuusuario.turso.io`)
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_KEY`: clave para ver `/asistentes` (la página pide la clave y recuerda la sesión 30 días).
     Usa una clave larga y aleatoria (20+ caracteres) para que no se pueda adivinar.
     **Obligatoria en producción**: sin ella `/asistentes` responde 404 para no exponer los datos de los invitados.
3. Despliega. La tabla se crea sola en la primera confirmación.
