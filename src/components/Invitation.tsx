import type { CSSProperties } from "react";
import { LINES, u, type TextLine } from "@/lib/layout";
import { RsvpButtons } from "./RsvpButtons";

const FONT_CLASS: Record<TextLine["font"], string> = {
  lora: "font-serif uppercase",
  loraBold: "font-serif caps",
  display: "font-display font-medium [font-variant-numeric:lining-nums] [font-variation-settings:'opsz'_72]",
  script: "font-script",
};

// Destellos sobre la bola disco y las estrellas del diseño.
const SPARKLES = [
  { x: 578, y: 150, s: 22, d: 0 },
  { x: 646, y: 196, s: 18, d: 1.1 },
  { x: 604, y: 222, s: 14, d: 1.9 },
  { x: 495, y: 155, s: 26, d: 0.6 },
  { x: 727, y: 160, s: 26, d: 1.5 },
  { x: 451, y: 207, s: 22, d: 2.2 },
  { x: 778, y: 202, s: 22, d: 0.3 },
];

function lineStyle(line: TextLine, index: number): CSSProperties {
  return {
    top: u(line.top),
    left: u(line.cx),
    fontSize: u(line.size),
    letterSpacing: u(line.ls),
    // Compensa el espacio que letter-spacing añade tras la última letra.
    paddingLeft: u(line.ls),
    transform: line.sx ? `translateX(-50%) scaleX(${line.sx})` : undefined,
    animationDelay: `${200 + index * 70}ms`,
  };
}

export function Invitation() {
  return (
    <div className="invitation select-none">
      {/* Fondo: tarjeta plateada, marco, bola disco, moño y divisores. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/invitacion-base.webp"
        alt=""
        aria-hidden
        draggable={false}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full"
      />

      {SPARKLES.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="sparkle"
          style={{ left: u(s.x), top: u(s.y), width: u(s.s), height: u(s.s), animationDelay: `${s.d}s` }}
          aria-hidden
        >
          <path d="M10 0 C11 8 12 9 20 10 C12 11 11 12 10 20 C9 12 8 11 0 10 C8 9 9 8 10 0Z" fill="#fff" />
        </svg>
      ))}

      <div>
        {LINES.map((line, i) => (
          <p key={line.id} className={`line fade-up ${FONT_CLASS[line.font]}`} style={lineStyle(line, i)}>
            {line.text}
          </p>
        ))}
      </div>

      <RsvpButtons />
    </div>
  );
}
