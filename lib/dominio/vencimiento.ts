import type { MomentoLocal, Tarea } from "@/lib/tipos/tarea";
import { diferenciaEnDias } from "./fecha-local";
import { nombreDia, nombreDiaCorto, fechaCorta } from "./formato-fecha";

type DatosTemporales = Pick<Tarea, "fechaVencimiento" | "horaVencimiento" | "completada">;

/**
 * Una tarea está vencida cuando no está completada y su vencimiento ya pasó:
 * - con hora: el minuto indicado ya transcurrió;
 * - sin hora: el día completo ya terminó.
 */
export function estaVencida(tarea: DatosTemporales, ahora: MomentoLocal): boolean {
  if (tarea.completada || tarea.fechaVencimiento === null) return false;
  if (tarea.fechaVencimiento < ahora.fecha) return true;
  if (tarea.fechaVencimiento > ahora.fecha) return false;
  return tarea.horaVencimiento !== null && tarea.horaVencimiento < ahora.hora;
}

export type EstadoTemporal =
  | "sin-fecha"
  | "vencida"
  | "hoy"
  /** Dentro de los próximos seis días. */
  | "proxima"
  | "futura"
  /** Completada con fecha anterior a hoy. */
  | "pasada";

export function clasificarTemporalmente(tarea: DatosTemporales, ahora: MomentoLocal): EstadoTemporal {
  if (tarea.fechaVencimiento === null) return "sin-fecha";
  if (estaVencida(tarea, ahora)) return "vencida";
  const dias = diferenciaEnDias(ahora.fecha, tarea.fechaVencimiento);
  if (dias < 0) return "pasada";
  if (dias === 0) return "hoy";
  if (dias <= 6) return "proxima";
  return "futura";
}

export interface DescripcionVencimiento {
  estado: Exclude<EstadoTemporal, "sin-fecha">;
  /** Día relativo legible: «Hoy», «Mañana», «Viernes», «12 sep». */
  dia: string;
  hora: string | null;
  /** Texto completo para filas: «Mañana · 09:30». */
  texto: string;
}

/** Nombre relativo de una fecha respecto a hoy. */
export function diaRelativo(fecha: string, ahora: MomentoLocal): string {
  const dias = diferenciaEnDias(ahora.fecha, fecha);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias === -1) return "Ayer";
  if (dias > 1 && dias <= 6) return nombreDia(fecha);
  if (dias < -1 && dias >= -6) return `${nombreDiaCorto(fecha)} ${fechaCorta(fecha, ahora.fecha)}`;
  return fechaCorta(fecha, ahora.fecha);
}

/** `null` cuando la tarea no tiene fecha: la interfaz no muestra nada en ese caso. */
export function describirVencimiento(tarea: DatosTemporales, ahora: MomentoLocal): DescripcionVencimiento | null {
  if (tarea.fechaVencimiento === null) return null;
  const estado = clasificarTemporalmente(tarea, ahora);
  if (estado === "sin-fecha") return null;
  const dia = diaRelativo(tarea.fechaVencimiento, ahora);
  const hora = tarea.horaVencimiento;
  return { estado, dia, hora, texto: hora ? `${dia} · ${hora}` : dia };
}
