import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { RepositorioEtiquetas, RepositorioTareas } from "@/lib/tipos/puertos";
import type { Tarea } from "@/lib/tipos/tarea";

/**
 * Estado de un usuario. El adaptador local lo persiste en disco;
 * las pruebas lo mantienen en memoria.
 */
export interface DatosUsuario {
  tareas: Tarea[];
  etiquetas: Etiqueta[];
}

/** Acceso transaccional a los datos de un usuario: `leer` y `modificar` son síncronos y atómicos. */
export interface AlmacenDatosUsuario {
  leer(): DatosUsuario;
  modificar<T>(cambio: (datos: DatosUsuario) => T): T;
}

export function crearAlmacenEnMemoria(inicial: DatosUsuario = { tareas: [], etiquetas: [] }): AlmacenDatosUsuario {
  let datos = structuredClone(inicial);
  return {
    leer: () => structuredClone(datos),
    modificar(cambio) {
      const borrador = structuredClone(datos);
      const resultado = cambio(borrador);
      datos = borrador;
      return resultado;
    },
  };
}

export function crearRepositorioTareas(almacen: AlmacenDatosUsuario): RepositorioTareas {
  return {
    async listar() {
      return almacen.leer().tareas;
    },
    async obtener(id) {
      return almacen.leer().tareas.find((tarea) => tarea.id === id) ?? null;
    },
    async insertar(tarea) {
      return almacen.modificar((datos) => {
        if (datos.tareas.some((existente) => existente.id === tarea.id)) {
          throw new Error(`Ya existe una tarea con id ${tarea.id}`);
        }
        datos.tareas.push(structuredClone(tarea));
        return tarea;
      });
    },
    async guardar(tarea) {
      return almacen.modificar((datos) => {
        const indice = datos.tareas.findIndex((existente) => existente.id === tarea.id);
        if (indice === -1) throw new Error(`No existe la tarea ${tarea.id}`);
        datos.tareas[indice] = structuredClone(tarea);
        return tarea;
      });
    },
    async eliminar(id) {
      return almacen.modificar((datos) => {
        const antes = datos.tareas.length;
        datos.tareas = datos.tareas.filter((tarea) => tarea.id !== id);
        return datos.tareas.length < antes;
      });
    },
  };
}

export function crearRepositorioEtiquetas(almacen: AlmacenDatosUsuario): RepositorioEtiquetas {
  return {
    async listar() {
      return almacen.leer().etiquetas;
    },
    async obtener(id) {
      return almacen.leer().etiquetas.find((etiqueta) => etiqueta.id === id) ?? null;
    },
    async insertar(etiqueta) {
      return almacen.modificar((datos) => {
        if (datos.etiquetas.some((existente) => existente.id === etiqueta.id)) {
          throw new Error(`Ya existe una etiqueta con id ${etiqueta.id}`);
        }
        datos.etiquetas.push(structuredClone(etiqueta));
        return etiqueta;
      });
    },
    async guardar(etiqueta) {
      return almacen.modificar((datos) => {
        const indice = datos.etiquetas.findIndex((existente) => existente.id === etiqueta.id);
        if (indice === -1) throw new Error(`No existe la etiqueta ${etiqueta.id}`);
        datos.etiquetas[indice] = structuredClone(etiqueta);
        return etiqueta;
      });
    },
    async eliminar(id) {
      return almacen.modificar((datos) => {
        const antes = datos.etiquetas.length;
        datos.etiquetas = datos.etiquetas.filter((etiqueta) => etiqueta.id !== id);
        // Como ON DELETE CASCADE en tareas_etiquetas: se borra la relación, nunca la tarea.
        datos.tareas = datos.tareas.map((tarea) => ({
          ...tarea,
          etiquetaIds: tarea.etiquetaIds.filter((etiquetaId) => etiquetaId !== id),
        }));
        return datos.etiquetas.length < antes;
      });
    },
  };
}
