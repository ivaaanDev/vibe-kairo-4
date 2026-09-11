import {
  construirExportacion,
  nombreArchivoExportacion,
  serializarExportacion,
  tipoMimeExportacion,
} from "@/lib/dominio/exportacion";
import type { FormatoExportacion } from "@/lib/tipos/api";
import type { RepositorioEtiquetas, RepositorioTareas } from "@/lib/tipos/puertos";
import type { FechaLocal } from "@/lib/tipos/tarea";

export interface ArchivoExportado {
  nombre: string;
  tipoMime: string;
  contenido: string;
}

export function crearServicioExportacion(deps: {
  tareas: RepositorioTareas;
  etiquetas: RepositorioEtiquetas;
  reloj: () => Date;
}) {
  return {
    /** Siempre exporta todas las tareas y etiquetas del usuario, sin importar filtros de la interfaz. */
    async exportar(formato: FormatoExportacion, fechaLocal: FechaLocal): Promise<ArchivoExportado> {
      const [tareas, etiquetas] = await Promise.all([deps.tareas.listar(), deps.etiquetas.listar()]);
      const documento = construirExportacion(tareas, etiquetas, deps.reloj().toISOString());
      return {
        nombre: nombreArchivoExportacion(formato, fechaLocal),
        tipoMime: tipoMimeExportacion(formato),
        contenido: serializarExportacion(documento, formato),
      };
    },
  };
}
