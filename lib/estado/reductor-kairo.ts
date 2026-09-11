import { desvincularEtiqueta } from "@/lib/dominio/etiquetas";
import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { Tarea } from "@/lib/tipos/tarea";

/*
 * Estado de cliente de Kairo como reductor puro. Lo usa el proveedor React de la web
 * y podría usarlo sin cambios una app React Native (useReducer, Zustand, etc.).
 */

export interface EstadoKairo {
  tareas: Tarea[];
  etiquetas: Etiqueta[];
}

export type AccionKairo =
  | { tipo: "tarea-agregada"; tarea: Tarea }
  | { tipo: "tarea-reemplazada"; tarea: Tarea }
  | { tipo: "tarea-eliminada"; id: string }
  | { tipo: "etiqueta-agregada"; etiqueta: Etiqueta }
  | { tipo: "etiqueta-reemplazada"; etiqueta: Etiqueta }
  | { tipo: "etiqueta-eliminada"; id: string }
  | { tipo: "estado-reemplazado"; estado: EstadoKairo };

export function reductorKairo(estado: EstadoKairo, accion: AccionKairo): EstadoKairo {
  switch (accion.tipo) {
    case "tarea-agregada":
      if (estado.tareas.some((tarea) => tarea.id === accion.tarea.id)) return estado;
      return { ...estado, tareas: [...estado.tareas, accion.tarea] };
    case "tarea-reemplazada":
      if (!estado.tareas.some((tarea) => tarea.id === accion.tarea.id)) return estado;
      return { ...estado, tareas: estado.tareas.map((tarea) => (tarea.id === accion.tarea.id ? accion.tarea : tarea)) };
    case "tarea-eliminada":
      return { ...estado, tareas: estado.tareas.filter((tarea) => tarea.id !== accion.id) };
    case "etiqueta-agregada":
      if (estado.etiquetas.some((etiqueta) => etiqueta.id === accion.etiqueta.id)) return estado;
      return { ...estado, etiquetas: [...estado.etiquetas, accion.etiqueta] };
    case "etiqueta-reemplazada":
      return {
        ...estado,
        etiquetas: estado.etiquetas.map((etiqueta) => (etiqueta.id === accion.etiqueta.id ? accion.etiqueta : etiqueta)),
      };
    case "etiqueta-eliminada":
      return {
        etiquetas: estado.etiquetas.filter((etiqueta) => etiqueta.id !== accion.id),
        tareas: desvincularEtiqueta(estado.tareas, accion.id),
      };
    case "estado-reemplazado":
      return accion.estado;
  }
}
