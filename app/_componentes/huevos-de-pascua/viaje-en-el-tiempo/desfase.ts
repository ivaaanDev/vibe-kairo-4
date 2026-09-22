import { tituloDia } from "@/lib/dominio/agenda";
import { sumarDias } from "@/lib/dominio/fecha-local";
import { fechaLarga } from "@/lib/dominio/formato-fecha";
import { diaRelativo } from "@/lib/dominio/vencimiento";
import type { FechaLocal, HoraLocal, MomentoLocal } from "@/lib/tipos/tarea";
import type { Desfase } from "./secuencia";

/*
 * Lectura desplazada de una fecha. Se reutilizan los formateadores reales —son
 * funciones puras— pasándoles un «ahora» ficticio: así las palabras que aparecen
 * durante el efecto son las mismas que Kairo escribiría ese otro día. Ninguna
 * tarea, ni el reloj compartido, ni la clasificación temporal se tocan.
 */

/** Adelantar la lectura un día equivale a retroceder un día el instante de referencia. */
export function ahoraDesfasado(ahora: MomentoLocal, dias: Desfase): MomentoLocal {
  return dias === 0 ? ahora : { ...ahora, fecha: sumarDias(ahora.fecha, -dias) };
}

/** «Hoy · 18:30» → «Mañana · 18:30». La hora y el prefijo («Vencida · ») no cambian. */
export function textoVencimientoDesfasado(
  fecha: FechaLocal | null,
  hora: HoraLocal | null,
  ahora: MomentoLocal,
  dias: Desfase,
  prefijo = "",
): string {
  if (fecha === null) return prefijo;
  const dia = diaRelativo(fecha, ahoraDesfasado(ahora, dias));
  return `${prefijo}${hora ? `${dia} · ${hora}` : dia}`;
}

/** Títulos de los grupos de agenda. «Vencidas» no es una fecha: se queda igual. */
export function tituloGrupoDesfasado(fecha: FechaLocal | null, titulo: string, ahora: MomentoLocal, dias: Desfase): string {
  return fecha === null ? titulo : tituloDia(fecha, ahoraDesfasado(ahora, dias));
}

/** Subtítulo de Agenda: aquí sí se desplaza la fecha mostrada, no la referencia. */
export function fechaLargaDesfasada(ahora: MomentoLocal, dias: Desfase): string {
  return fechaLarga(sumarDias(ahora.fecha, dias));
}
