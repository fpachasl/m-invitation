"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { submitRsvp, type RsvpState } from "@/app/actions";
import { EVENT } from "@/lib/event";
import { BUTTONS, u } from "@/lib/layout";

type Choice = "si" | "no";
type SavedRsvp = { name: string; attending: boolean; guests: number };

const DEVICE_KEY = "invitacion-60:device";
const SAVED_KEY = "invitacion-60:rsvp";

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function getDeviceId() {
  let id = readStorage<string>(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(DEVICE_KEY, JSON.stringify(id));
    } catch {}
  }
  return id;
}

const pill =
  "absolute flex items-center justify-center rounded-full border-ink font-serif font-bold uppercase text-ink " +
  "transition-colors duration-300 hover:bg-ink hover:text-[#e9e9e9] focus-visible:bg-ink focus-visible:text-[#e9e9e9] " +
  "focus-visible:outline-none cursor-pointer";

export function RsvpButtons() {
  const [choice, setChoice] = useState<Choice | null>(null);

  const label = (text: string, left: number, value: Choice) => (
    <button
      type="button"
      onClick={() => setChoice(value)}
      className={`${pill} fade-up`}
      style={{
        top: u(BUTTONS.top),
        left: u(left),
        width: u(BUTTONS.width),
        height: u(BUTTONS.height),
        borderWidth: u(3),
        fontSize: u(BUTTONS.fontSize),
        letterSpacing: u(BUTTONS.ls),
        paddingLeft: u(BUTTONS.ls),
        animationDelay: "1.6s",
      }}
    >
      {text}
    </button>
  );

  return (
    <>
      {label("Sí iré", BUTTONS.yes.left, "si")}
      {label("No iré", BUTTONS.no.left, "no")}
      <AnimatePresence>
        {choice && <RsvpDialog key={choice} choice={choice} onClose={() => setChoice(null)} />}
      </AnimatePresence>
    </>
  );
}

function RsvpDialog({ choice, onClose }: { choice: Choice; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(submitRsvp, { status: "idle" });
  const [saved] = useState(() => readStorage<SavedRsvp>(SAVED_KEY));
  const [guests, setGuests] = useState(() => (saved?.attending ? saved.guests : 1));
  const [deviceId] = useState(getDeviceId);
  const dialogRef = useRef<HTMLDivElement>(null);
  const attending = choice === "si";

  useEffect(() => {
    if (state.status === "success") {
      try {
        localStorage.setItem(
          SAVED_KEY,
          JSON.stringify({ name: state.name, attending: state.attending, guests: state.guests }),
        );
      } catch {}
    } else if (state.status === "error" && !state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-title"
        className="silver-card relative max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto p-[6px] shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
      >
        <div className="relative border-[3px] border-ink px-6 pb-7 pt-8 sm:px-9">
          <div className="pointer-events-none absolute inset-[4px] border border-ink/80" aria-hidden />

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-2 z-10 cursor-pointer p-1 text-2xl leading-none text-ink/70 hover:text-ink"
          >
            ×
          </button>

          {state.status === "success" ? (
            <div className="relative py-4 text-center">
              <Divider />
              <h2 id="rsvp-title" className="mt-5 font-script text-5xl text-ink">
                {state.attending ? "¡Gracias!" : "¡Te extrañaremos!"}
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-sm font-bold uppercase leading-relaxed tracking-[0.2em] text-ink">
                {state.attending
                  ? `${state.name}, confirmamos ${state.guests === 1 ? "1 asistente" : `${state.guests} asistentes`}`
                  : `${state.name}, gracias por avisarnos`}
              </p>
              {state.attending && (
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-ink/80">
                  {EVENT.dayName} {EVENT.day} {EVENT.month} · {EVENT.time}
                </p>
              )}
              <div className="mt-6">
                <Divider small />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 cursor-pointer rounded-full border-[2.5px] border-ink px-8 py-2.5 text-sm font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:bg-ink hover:text-[#e9e9e9]"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form action={formAction} className="relative" noValidate>
              <input type="hidden" name="attending" value={choice} />
              <input type="hidden" name="deviceId" value={deviceId} />
              {attending && <input type="hidden" name="guests" value={guests} />}

              <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-ink/80">
                Confirmar asistencia
              </p>
              <h2 id="rsvp-title" className="mt-1 text-center font-script text-[2.6rem] leading-tight text-ink">
                {attending ? "¡Qué alegría!" : "Te extrañaremos"}
              </h2>
              <div className="mt-3">
                <Divider small />
              </div>

              <label className="mt-6 block">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink">Tu nombre</span>
                <input
                  name="name"
                  autoComplete="name"
                  defaultValue={saved?.name}
                  maxLength={80}
                  required
                  aria-invalid={!!fieldErrors?.name}
                  className="mt-2 w-full rounded-full border-2 border-ink/80 bg-white/45 px-5 py-2.5 text-base text-ink outline-none placeholder:text-ink/40 focus:border-ink focus:bg-white/70"
                  placeholder="Nombre y apellido"
                />
                {fieldErrors?.name && <span className="mt-1 block pl-5 text-sm text-red-800">{fieldErrors.name}</span>}
              </label>

              {attending && (
                <div className="mt-5">
                  <span id="guests-label" className="text-xs font-bold uppercase tracking-[0.25em] text-ink">
                    ¿Cuántas personas asistirán?
                  </span>
                  <p className="mt-0.5 text-xs text-ink/70">Inclúyete a ti en el conteo.</p>
                  <div className="mt-2 flex items-center justify-center gap-5" role="group" aria-labelledby="guests-label">
                    <StepButton label="Una persona menos" disabled={guests <= 1} onClick={() => setGuests((g) => g - 1)}>
                      −
                    </StepButton>
                    <motion.span
                      key={guests}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-14 text-center font-serif text-5xl text-ink"
                      aria-live="polite"
                    >
                      {guests}
                    </motion.span>
                    <StepButton
                      label="Una persona más"
                      disabled={guests >= EVENT.maxGuests}
                      onClick={() => setGuests((g) => g + 1)}
                    >
                      +
                    </StepButton>
                  </div>
                  {fieldErrors?.guests && <span className="mt-1 block text-center text-sm text-red-800">{fieldErrors.guests}</span>}
                </div>
              )}

              <label className="mt-5 block">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink">
                  Mensaje <span className="font-normal normal-case tracking-normal text-ink/60">(opcional)</span>
                </span>
                <textarea
                  name="message"
                  rows={2}
                  maxLength={300}
                  className="mt-2 w-full resize-none rounded-2xl border-2 border-ink/80 bg-white/45 px-5 py-2.5 text-base text-ink outline-none placeholder:text-ink/40 focus:border-ink focus:bg-white/70"
                  placeholder={attending ? "Unas palabras para este día especial" : "Déjale un saludo"}
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="mt-6 w-full cursor-pointer rounded-full border-[2.5px] border-ink bg-ink py-3 text-sm font-bold uppercase tracking-[0.3em] text-[#ececec] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? "Enviando…" : attending ? "Confirmar" : "Enviar respuesta"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-ink text-2xl leading-none text-ink transition-colors hover:bg-ink hover:text-[#e9e9e9] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
    >
      {children}
    </button>
  );
}

function Divider({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 text-ink" aria-hidden>
      <span className={`h-px bg-ink ${small ? "w-16" : "w-24"}`} />
      <svg viewBox="0 0 20 20" className="size-3 fill-current">
        <path d="M10 0 C11 8 12 9 20 10 C12 11 11 12 10 20 C9 12 8 11 0 10 C8 9 9 8 10 0Z" />
      </svg>
      <span className={`h-px bg-ink ${small ? "w-16" : "w-24"}`} />
    </div>
  );
}
