import type { FechaLocal } from "@/lib/tipos/tarea";
import { diaDeLaSemana, partesDeFecha } from "./fecha-local";

/*
 * Nombres en español escritos a mano en lugar de Intl: el resultado es idéntico
 * en Node, en cualquier navegador y en Hermes (React Native).
 */
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;

export function nombreDia(fecha: FechaLocal): string {
  return DIAS[diaDeLaSemana(fecha)] ?? "";
}

export function nombreDiaCorto(fecha: FechaLocal): string {
  return DIAS_CORTOS[diaDeLaSemana(fecha)] ?? "";
}

/** «12 sep», o «12 sep 2027» si no es el año de referencia. */
export function fechaCorta(fecha: FechaLocal, referencia: FechaLocal): string {
  const { anio, mes, dia } = partesDeFecha(fecha);
  const base = `${dia} ${MESES_CORTOS[mes - 1] ?? ""}`;
  return anio === partesDeFecha(referencia).anio ? base : `${base} ${anio}`;
}

/** «Jueves, 10 de septiembre». */
export function fechaLarga(fecha: FechaLocal): string {
  const { mes, dia } = partesDeFecha(fecha);
  return `${nombreDia(fecha)}, ${dia} de ${MESES[mes - 1] ?? ""}`;
}
