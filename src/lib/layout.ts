import { EVENT } from "./event";

/** Convierte píxeles del diseño original a unidades escaladas (ver .invitation en globals.css). */
export const u = (px: number) => `calc(var(--u) * ${px})`;

/**
 * Posición de cada línea de texto en píxeles del diseño original (1240 × 1748).
 * top = borde superior de la caja (line-height: 1), cx = centro horizontal,
 * ls = espaciado entre letras, también en píxeles del diseño.
 */
export type TextLine = {
  id: string;
  text: string;
  font: "lora" | "loraBold" | "display" | "script";
  size: number;
  top: number;
  cx: number;
  ls: number;
  /** Escala horizontal opcional para igualar el ancho del diseño. */
  sx?: number;
};

export const LINES: TextLine[] = [
  { id: "inv1", text: "Estás invitado(a) a celebrar", font: "loraBold", size: 30, top: 266, cx: 612, ls: 6.8 },
  { id: "inv2", text: "conmigo mis", font: "loraBold", size: 30, top: 303, cx: 612, ls: 6.8 },
  { id: "age", text: EVENT.age, font: "display", size: 282, top: 353, cx: 596.5, ls: -12, sx: 1.07 },
  { id: "years", text: "Años", font: "lora", size: 74, top: 571, cx: 615, ls: 22 },
  { id: "honor1", text: "Será un honor contar", font: "loraBold", size: 24, top: 662, cx: 614, ls: 5 },
  { id: "honor2", text: "con tu presencia en esta", font: "loraBold", size: 24, top: 695, cx: 614, ls: 5 },
  { id: "honor3", text: "celebración tan especial", font: "loraBold", size: 24, top: 727, cx: 614, ls: 5 },
  { id: "dayName", text: EVENT.dayName, font: "loraBold", size: 28, top: 1080, cx: 304, ls: 4.2 },
  { id: "day", text: EVENT.day, font: "lora", size: 83, top: 1111, cx: 302, ls: 0 },
  { id: "month", text: EVENT.month, font: "loraBold", size: 27, top: 1196, cx: 304, ls: 5 },
  { id: "timeLabel", text: "Hora", font: "loraBold", size: 24, top: 1082, cx: 616, ls: 4.8 },
  { id: "time", text: EVENT.time, font: "lora", size: 51.3, top: 1135, cx: 616, ls: 1.3 },
  { id: "addressLabel", text: "Dirección", font: "loraBold", size: 24, top: 1082, cx: 936, ls: 4.2 },
  { id: "address1", text: EVENT.address[0], font: "loraBold", size: 24, top: 1130, cx: 936, ls: 5 },
  { id: "address2", text: EVENT.address[1], font: "loraBold", size: 24, top: 1163, cx: 936, ls: 5 },
  { id: "address3", text: EVENT.address[2], font: "loraBold", size: 24, top: 1195, cx: 936, ls: 5 },
  { id: "dressLabel", text: "Código de vestimenta", font: "loraBold", size: 23, top: 1306, cx: 614, ls: 4.4 },
  { id: "dress", text: EVENT.dressCode, font: "loraBold", size: 33.3, top: 1342, cx: 614, ls: 6.8 },
  { id: "script1", text: "¡Te espero para compartir", font: "script", size: 52, top: 1430, cx: 617.5, ls: 0 },
  { id: "script2", text: "este día tan especial!", font: "script", size: 52, top: 1471, cx: 612, ls: 0 },
  { id: "confirm", text: "Confirmar asistencia", font: "loraBold", size: 22, top: 1575.5, cx: 614, ls: 4.93 },
];

/** Botones de confirmación (píxeles del diseño). */
export const BUTTONS = {
  top: 1623,
  height: 67,
  width: 244,
  yes: { left: 364 },
  no: { left: 634 },
  fontSize: 27,
  ls: 6,
} as const;
