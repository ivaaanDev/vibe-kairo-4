import { aplicarCambios, crearTarea } from "@/lib/dominio/validacion-tarea";
import type { RepositorioEtiquetas, RepositorioTareas } from "@/lib/tipos/puertos";
import { exito, fallo, type Resultado } from "@/lib/tipos/resultado";
import type { CambiosTarea, NuevaTarea, Tarea } from "@/lib/tipos/tarea";

export interface DependenciasServicioTareas {
  tareas: RepositorioTareas;
  etiquetas: RepositorioEtiquetas;
  reloj: () => Date;
}

const NO_ENCONTRADA = { codigo: "no-encontrado", mensaje: "La tarea ya no existe." } as const;

/** Casos de uso de tareas: orquestan dominio y persistencia, sin saber de HTTP ni de React. */
export function crearServicioTareas({ tareas, etiquetas, reloj }: DependenciasServicioTareas) {
  return {
    listar(): Promise<Tarea[]> {
      return tareas.listar();
    },

    async crear(datos: NuevaTarea): Promise<Resultado<Tarea>> {
      const tarea = crearTarea(datos, reloj().toISOString());
      if (!tarea.ok) return tarea;
      return exito(await tareas.insertar(tarea.valor));
    },

    async actualizar(id: string, cambios: CambiosTarea): Promise<Resultado<Tarea>> {
      const actual = await tareas.obtener(id);
      if (!actual) return fallo(NO_ENCONTRADA);
      const existentes =
        cambios.etiquetaIds !== undefined ? new Set((await etiquetas.listar()).map((etiqueta) => etiqueta.id)) : new Set(actual.etiquetaIds);
      const siguiente = aplicarCambios(actual, cambios, {
        etiquetasExistentes: existentes,
        instante: reloj().toISOString(),
      });
      if (!siguiente.ok) return siguiente;
      return exito(await tareas.guardar(siguiente.valor));
    },

    async eliminar(id: string): Promise<Resultado<null>> {
      const eliminada = await tareas.eliminar(id);
      return eliminada ? exito(null) : fallo(NO_ENCONTRADA);
    },
  };
}

export type ServicioTareas = ReturnType<typeof crearServicioTareas>;
