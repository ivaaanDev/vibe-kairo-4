import type { FechaLocal, HoraLocal, MomentoLocal } from "@/lib/tipos/tarea";

/*
 * Aritmética de calendario sobre fechas locales `YYYY-MM-DD`.
 * Las fechas de vencimiento no tienen zona horaria: «el martes» es el martes
 * del usuario esté donde esté. Internamente se opera en UTC para que el
 * resultado no dependa de la zona horaria de la máquina.
 */

const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const PATRON_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MS_POR_DIA = 86_400_000;

function relleno(valor: number, digitos = 2): string {
  return String(valor).padStart(digitos, "0");
}

function aUtc(fecha: FechaLocal): number {
  const coincidencia = PATRON_FECHA.exec(fecha);
  if (!coincidencia) throw new Error(`Fecha local inválida: ${fecha}`);
  const [, anio, mes, dia] = coincidencia;
  return Date.UTC(Number(anio), Number(mes) - 1, Number(dia));
}

function desdeUtc(ms: number): FechaLocal {
  const fecha = new Date(ms);
  return `${relleno(fecha.getUTCFullYear(), 4)}-${relleno(fecha.getUTCMonth() + 1)}-${relleno(fecha.getUTCDate())}`;
}

export function esFechaValida(valor: string): boolean {
  const coincidencia = PATRON_FECHA.exec(valor);
  if (!coincidencia) return false;
  const [, anio, mes, dia] = coincidencia.map(Number) as [number, number, number, number];
  if (mes < 1 || mes > 12 || dia < 1) return false;
  const diasDelMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return dia <= diasDelMes;
}

export function esHoraValida(valor: string): boolean {
  return PATRON_HORA.test(valor);
}

/** Convierte un `Date` al calendario y reloj de la zona horaria en que se ejecuta. */
export function momentoLocalDesde(fecha: Date): MomentoLocal {
  return {
    fecha: `${relleno(fecha.getFullYear(), 4)}-${relleno(fecha.getMonth() + 1)}-${relleno(fecha.getDate())}`,
    hora: `${relleno(fecha.getHours())}:${relleno(fecha.getMinutes())}`,
  };
}

export function sumarDias(fecha: FechaLocal, dias: number): FechaLocal {
  return desdeUtc(aUtc(fecha) + dias * MS_POR_DIA);
}

/** Días que hay que avanzar desde `desde` para llegar a `hasta` (negativo si es anterior). */
export function diferenciaEnDias(desde: FechaLocal, hasta: FechaLocal): number {
  return Math.round((aUtc(hasta) - aUtc(desde)) / MS_POR_DIA);
}

/** 0 = domingo … 6 = sábado. */
export function diaDeLaSemana(fecha: FechaLocal): number {
  return new Date(aUtc(fecha)).getUTCDay();
}

export function partesDeFecha(fecha: FechaLocal): { anio: number; mes: number; dia: number } {
  const utc = new Date(aUtc(fecha));
  return { anio: utc.getUTCFullYear(), mes: utc.getUTCMonth() + 1, dia: utc.getUTCDate() };
}

export function compararHoras(a: HoraLocal, b: HoraLocal): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
