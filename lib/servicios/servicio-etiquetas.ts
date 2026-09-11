import { crearEtiqueta, esColorEtiqueta, validarNombreEtiqueta } from "@/lib/dominio/etiquetas";
import type { CambiosEtiqueta, Etiqueta, NuevaEtiqueta } from "@/lib/tipos/etiqueta";
import type { RepositorioEtiquetas } from "@/lib/tipos/puertos";
import { exito, fallo, type Resultado } from "@/lib/tipos/resultado";

export interface DependenciasServicioEtiquetas {
  etiquetas: RepositorioEtiquetas;
  reloj: () => Date;
}

const NO_ENCONTRADA = { codigo: "no-encontrado", mensaje: "La etiqueta ya no existe." } as const;

export function crearServicioEtiquetas({ etiquetas, reloj }: DependenciasServicioEtiquetas) {
  return {
    listar(): Promise<Etiqueta[]> {
      return etiquetas.listar();
    },

    async crear(datos: NuevaEtiqueta): Promise<Resultado<Etiqueta>> {
      const etiqueta = crearEtiqueta(datos, await etiquetas.listar(), reloj().toISOString());
      if (!etiqueta.ok) return etiqueta;
      return exito(await etiquetas.insertar(etiqueta.valor));
    },

    async actualizar(id: string, cambios: CambiosEtiqueta): Promise<Resultado<Etiqueta>> {
      const existentes = await etiquetas.listar();
      const actual = existentes.find((etiqueta) => etiqueta.id === id);
      if (!actual) return fallo(NO_ENCONTRADA);
      const siguiente: Etiqueta = { ...actual };
      if (cambios.nombre !== undefined) {
        const nombre = validarNombreEtiqueta(cambios.nombre, existentes, id);
        if (!nombre.ok) return nombre;
        siguiente.nombre = nombre.valor;
      }
      if (cambios.color !== undefined) {
        if (!esColorEtiqueta(cambios.color)) {
          return fallo({ codigo: "color-invalido", mensaje: "El color elegido no está disponible.", campo: "color" });
        }
        siguiente.color = cambios.color;
      }
      return exito(await etiquetas.guardar(siguiente));
    },

    /** Elimina la etiqueta y sus relaciones; las tareas se conservan. */
    async eliminar(id: string): Promise<Resultado<null>> {
      const eliminada = await etiquetas.eliminar(id);
      return eliminada ? exito(null) : fallo(NO_ENCONTRADA);
    },
  };
}

export type ServicioEtiquetas = ReturnType<typeof crearServicioEtiquetas>;
