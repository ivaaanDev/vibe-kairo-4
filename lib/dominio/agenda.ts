import type { FechaLocal, MomentoLocal, Tarea } from "@/lib/tipos/tarea";
import { diferenciaEnDias, sumarDias } from "./fecha-local";
import { nombreDia, fechaCorta } from "./formato-fecha";
import { ordenarCronologicamente } from "./orden";
import { estaVencida } from "./vencimiento";

export const RANGOS_AGENDA = ["hoy", "semana"] as const;
export type RangoAgenda = (typeof RANGOS_AGENDA)[number];

export function esRangoAgenda(valor: unknown): valor is RangoAgenda {
  return typeof valor === "string" && (RANGOS_AGENDA as readonly string[]).includes(valor);
}

export interface GrupoAgenda<T extends Tarea = Tarea> {
  clave: string;
  tipo: "vencidas" | "dia";
  fecha: FechaLocal | null;
  titulo: string;
  tareas: T[];
}

/** Días que abarca cada rango, contando hoy. «Esta semana» es una ventana móvil de 7 días. */
export function diasDelRango(rango: RangoAgenda): number {
  return rango === "hoy" ? 1 : 7;
}

export function limitesDelRango(rango: RangoAgenda, ahora: MomentoLocal): { desde: FechaLocal; hasta: FechaLocal } {
  return { desde: ahora.fecha, hasta: sumarDias(ahora.fecha, diasDelRango(rango) - 1) };
}

export function tituloDia(fecha: FechaLocal, ahora: MomentoLocal): string {
  const dias = diferenciaEnDias(ahora.fecha, fecha);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  return `${nombreDia(fecha)} ${fechaCorta(fecha, ahora.fecha)}`;
}

export interface OpcionesAgenda {
  /**
   * Tareas completadas durante la sesión de la vista. Se agrupan como si siguieran
   * pendientes para que completar una vencida no la haga desaparecer de golpe.
   */
  retenidas?: ReadonlySet<string>;
}

/**
 * Agenda de un rango:
 * - primero, las tareas vencidas pendientes de días anteriores;
 * - después, un grupo por día con las tareas de ese día (incluidas las completadas,
 *   para poder revertirlas), en orden cronológico ascendente.
 * Las tareas sin fecha nunca forman parte de la agenda.
 */
export function calcularAgenda<T extends Tarea>(
  tareas: readonly T[],
  rango: RangoAgenda,
  ahora: MomentoLocal,
  { retenidas = new Set() }: OpcionesAgenda = {},
): GrupoAgenda<T>[] {
  const { desde, hasta } = limitesDelRango(rango, ahora);
  const conFecha = tareas.filter((tarea) => tarea.fechaVencimiento !== null);
  const vencidaParaAgrupar = (tarea: T) =>
    estaVencida(retenidas.has(tarea.id) ? { ...tarea, completada: false } : tarea, ahora);

  const atrasadas = ordenarCronologicamente(
    conFecha.filter((tarea) => (tarea.fechaVencimiento as FechaLocal) < desde && vencidaParaAgrupar(tarea)),
  );
  const enRango = ordenarCronologicamente(
    conFecha.filter((tarea) => {
      const fecha = tarea.fechaVencimiento as FechaLocal;
      return fecha >= desde && fecha <= hasta;
    }),
  );

  const grupos: GrupoAgenda<T>[] = [];
  if (atrasadas.length > 0) {
    grupos.push({ clave: "vencidas", tipo: "vencidas", fecha: null, titulo: "Vencidas", tareas: atrasadas });
  }

  const porDia = new Map<FechaLocal, T[]>();
  for (const tarea of enRango) {
    const fecha = tarea.fechaVencimiento as FechaLocal;
    const lista = porDia.get(fecha);
    if (lista) lista.push(tarea);
    else porDia.set(fecha, [tarea]);
  }
  for (const [fecha, lista] of porDia) {
    grupos.push({ clave: fecha, tipo: "dia", fecha, titulo: tituloDia(fecha, ahora), tareas: lista });
  }
  return grupos;
}

/**
 * Posición del marcador «ahora» dentro de las tareas de hoy (ya ordenadas):
 * antes de la primera tarea con hora posterior a este minuto.
 * `null` si el día no tiene tareas con hora, porque no habría nada que situar.
 */
export function posicionMarcadorAhora(tareasDeHoy: readonly Pick<Tarea, "horaVencimiento">[], ahora: MomentoLocal): number | null {
  if (!tareasDeHoy.some((tarea) => tarea.horaVencimiento !== null)) return null;
  const indice = tareasDeHoy.findIndex((tarea) => tarea.horaVencimiento !== null && tarea.horaVencimiento > ahora.hora);
  return indice === -1 ? tareasDeHoy.length : indice;
}

export function contarTareasAgenda(grupos: readonly GrupoAgenda[]): number {
  return grupos.reduce((total, grupo) => total + grupo.tareas.length, 0);
}

/** Pendientes de hoy (incluye vencidas): el número que orienta en la navegación. */
export function contarPendientesHoy(tareas: readonly Tarea[], ahora: MomentoLocal): number {
  return calcularAgenda(tareas, "hoy", ahora).reduce(
    (total, grupo) => total + grupo.tareas.filter((tarea) => !tarea.completada).length,
    0,
  );
}
