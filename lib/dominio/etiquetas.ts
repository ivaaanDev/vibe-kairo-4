import { COLORES_ETIQUETA, type ColorEtiqueta, type Etiqueta, type NuevaEtiqueta } from "@/lib/tipos/etiqueta";
import { exito, fallo, type Resultado } from "@/lib/tipos/resultado";
import type { Instante, Tarea } from "@/lib/tipos/tarea";
import { claveComparable, esIdValido, longitud } from "./texto";

export const LIMITES_ETIQUETA = { nombreMaximo: 40 } as const;

export function esColorEtiqueta(valor: unknown): valor is ColorEtiqueta {
  return typeof valor === "string" && (COLORES_ETIQUETA as readonly string[]).includes(valor);
}

export function validarNombreEtiqueta(
  valor: string,
  existentes: readonly Etiqueta[],
  idPropio?: string,
): Resultado<string> {
  const nombre = valor.replace(/\s+/g, " ").trim();
  if (nombre.length === 0) {
    return fallo({ codigo: "nombre-etiqueta-vacio", mensaje: "Escribe un nombre para la etiqueta.", campo: "nombre" });
  }
  if (longitud(nombre) > LIMITES_ETIQUETA.nombreMaximo) {
    return fallo({
      codigo: "nombre-etiqueta-largo",
      mensaje: `El nombre admite hasta ${LIMITES_ETIQUETA.nombreMaximo} caracteres.`,
      campo: "nombre",
    });
  }
  const clave = claveComparable(nombre);
  const duplicada = existentes.find((etiqueta) => etiqueta.id !== idPropio && claveComparable(etiqueta.nombre) === clave);
  if (duplicada) {
    return fallo({
      codigo: "nombre-etiqueta-duplicado",
      mensaje: `Ya existe la etiqueta «${duplicada.nombre}».`,
      campo: "nombre",
    });
  }
  return exito(nombre);
}

/** El color menos usado, en el orden de la paleta. Así las etiquetas nuevas se distinguen entre sí. */
export function siguienteColor(existentes: readonly Etiqueta[]): ColorEtiqueta {
  const usos = new Map<ColorEtiqueta, number>(COLORES_ETIQUETA.map((color) => [color, 0]));
  for (const etiqueta of existentes) usos.set(etiqueta.color, (usos.get(etiqueta.color) ?? 0) + 1);
  let elegido: ColorEtiqueta = COLORES_ETIQUETA[0];
  for (const color of COLORES_ETIQUETA) {
    if ((usos.get(color) ?? 0) < (usos.get(elegido) ?? 0)) elegido = color;
  }
  return elegido;
}

export function crearEtiqueta(
  datos: NuevaEtiqueta,
  existentes: readonly Etiqueta[],
  instante: Instante,
): Resultado<Etiqueta> {
  if (!esIdValido(datos.id)) {
    return fallo({ codigo: "id-invalido", mensaje: "El identificador de la etiqueta no es válido." });
  }
  const nombre = validarNombreEtiqueta(datos.nombre, existentes);
  if (!nombre.ok) return nombre;
  if (datos.color !== undefined && !esColorEtiqueta(datos.color)) {
    return fallo({ codigo: "color-invalido", mensaje: "El color elegido no está disponible.", campo: "color" });
  }
  return exito({
    id: datos.id,
    nombre: nombre.valor,
    color: datos.color ?? siguienteColor(existentes),
    creadaEn: instante,
  });
}

/** Normaliza la lista de etiquetas de una tarea: sin duplicados y solo etiquetas existentes. */
export function normalizarEtiquetaIds(ids: readonly string[], existentes: ReadonlySet<string>): Resultado<string[]> {
  const unicas = [...new Set(ids)];
  const desconocida = unicas.find((id) => !existentes.has(id));
  if (desconocida !== undefined) {
    return fallo({
      codigo: "etiqueta-desconocida",
      mensaje: "Una de las etiquetas ya no existe. Recarga para ver los cambios.",
      campo: "etiquetaIds",
    });
  }
  return exito(unicas);
}

export function asignarEtiqueta(tarea: Tarea, etiquetaId: string): Tarea {
  if (tarea.etiquetaIds.includes(etiquetaId)) return tarea;
  return { ...tarea, etiquetaIds: [...tarea.etiquetaIds, etiquetaId] };
}

export function retirarEtiqueta(tarea: Tarea, etiquetaId: string): Tarea {
  if (!tarea.etiquetaIds.includes(etiquetaId)) return tarea;
  return { ...tarea, etiquetaIds: tarea.etiquetaIds.filter((id) => id !== etiquetaId) };
}

/** Efecto de eliminar una etiqueta: las tareas se conservan, solo pierden la relación. */
export function desvincularEtiqueta(tareas: readonly Tarea[], etiquetaId: string): Tarea[] {
  return tareas.map((tarea) => retirarEtiqueta(tarea, etiquetaId));
}

/**
 * Filtro por etiquetas: una tarea pasa si tiene *alguna* de las etiquetas elegidas.
 * Sin selección, pasan todas.
 */
export function filtrarPorEtiquetas<T extends Pick<Tarea, "etiquetaIds">>(tareas: readonly T[], seleccion: readonly string[]): T[] {
  if (seleccion.length === 0) return [...tareas];
  const elegidas = new Set(seleccion);
  return tareas.filter((tarea) => tarea.etiquetaIds.some((id) => elegidas.has(id)));
}

export function contarTareasPorEtiqueta(tareas: readonly Tarea[]): Map<string, number> {
  const conteo = new Map<string, number>();
  for (const tarea of tareas) {
    for (const id of tarea.etiquetaIds) conteo.set(id, (conteo.get(id) ?? 0) + 1);
  }
  return conteo;
}

/** Resuelve los ids de una tarea a etiquetas, en el orden en que se asignaron. */
export function etiquetasDeTarea(tarea: Pick<Tarea, "etiquetaIds">, porId: ReadonlyMap<string, Etiqueta>): Etiqueta[] {
  return tarea.etiquetaIds.flatMap((id) => {
    const etiqueta = porId.get(id);
    return etiqueta ? [etiqueta] : [];
  });
}

export function ordenarEtiquetas(etiquetas: readonly Etiqueta[]): Etiqueta[] {
  return [...etiquetas].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
}
