import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { MomentoLocal, Tarea } from "@/lib/tipos/tarea";

let secuencia = 0;

/** UUID v4 determinista para pruebas. */
export function idDePrueba(): string {
  secuencia += 1;
  return `00000000-0000-4000-8000-${String(secuencia).padStart(12, "0")}`;
}

export function tarea(parcial: Partial<Tarea> = {}): Tarea {
  return {
    id: idDePrueba(),
    titulo: "Tarea",
    descripcion: null,
    fechaVencimiento: null,
    horaVencimiento: null,
    completada: false,
    completadaEn: null,
    etiquetaIds: [],
    creadaEn: "2026-09-01T10:00:00.000Z",
    actualizadaEn: "2026-09-01T10:00:00.000Z",
    ...parcial,
  };
}

export function etiqueta(parcial: Partial<Etiqueta> = {}): Etiqueta {
  return { id: idDePrueba(), nombre: "Trabajo", color: "pizarra", creadaEn: "2026-09-01T10:00:00.000Z", ...parcial };
}

/** Jueves 10 de septiembre de 2026, 14:30. */
export const AHORA: MomentoLocal = { fecha: "2026-09-10", hora: "14:30" };
