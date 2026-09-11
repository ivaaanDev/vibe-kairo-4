import type { Tarea } from "@/lib/tipos/tarea";

type DatosOrden = Pick<Tarea, "id" | "fechaVencimiento" | "horaVencimiento" | "creadaEn">;

/**
 * Orden cronológico ascendente: por fecha; dentro del mismo día, las tareas
 * sin hora primero (valen para todo el día) y después por hora.
 * Las tareas sin fecha van al final. Empates: por creación.
 */
export function compararCronologicamente(a: DatosOrden, b: DatosOrden): number {
  if (a.fechaVencimiento !== b.fechaVencimiento) {
    if (a.fechaVencimiento === null) return 1;
    if (b.fechaVencimiento === null) return -1;
    return a.fechaVencimiento < b.fechaVencimiento ? -1 : 1;
  }
  if (a.horaVencimiento !== b.horaVencimiento) {
    if (a.horaVencimiento === null) return -1;
    if (b.horaVencimiento === null) return 1;
    return a.horaVencimiento < b.horaVencimiento ? -1 : 1;
  }
  if (a.creadaEn !== b.creadaEn) return a.creadaEn < b.creadaEn ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function ordenarCronologicamente<T extends DatosOrden>(tareas: readonly T[]): T[] {
  return [...tareas].sort(compararCronologicamente);
}

export interface ListaOrdenada<T> {
  pendientes: T[];
  completadas: T[];
}

/**
 * Orden de la lista general: pendientes de la más reciente a la más antigua
 * (la tarea recién creada aparece junto al campo de alta) y completadas al final,
 * de la última completada a la primera.
 *
 * `retenidas` son tareas completadas durante la sesión de la vista: permanecen en
 * su posición entre las pendientes para que completar no las haga saltar.
 */
export function ordenarLista<T extends Pick<Tarea, "id" | "completada" | "completadaEn" | "creadaEn">>(
  tareas: readonly T[],
  retenidas: ReadonlySet<string> = new Set(),
): ListaOrdenada<T> {
  const pendientes: T[] = [];
  const completadas: T[] = [];
  for (const tarea of tareas) {
    if (!tarea.completada || retenidas.has(tarea.id)) pendientes.push(tarea);
    else completadas.push(tarea);
  }
  pendientes.sort((a, b) => (a.creadaEn === b.creadaEn ? (a.id < b.id ? 1 : -1) : a.creadaEn < b.creadaEn ? 1 : -1));
  completadas.sort((a, b) => {
    const ca = a.completadaEn ?? "";
    const cb = b.completadaEn ?? "";
    return ca === cb ? (a.id < b.id ? 1 : -1) : ca < cb ? 1 : -1;
  });
  return { pendientes, completadas };
}
