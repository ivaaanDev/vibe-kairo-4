import { exito, fallo, type Resultado } from "@/lib/tipos/resultado";
import type { CambiosTarea, FechaLocal, HoraLocal, Instante, NuevaTarea, Tarea } from "@/lib/tipos/tarea";
import { normalizarEtiquetaIds } from "./etiquetas";
import { esFechaValida, esHoraValida } from "./fecha-local";
import { esIdValido, longitud } from "./texto";

export const LIMITES_TAREA = {
  tituloMaximo: 140,
  descripcionMaxima: 500,
} as const;

export function validarTitulo(valor: string): Resultado<string> {
  // Un título es una sola línea: los saltos pegados desde otro sitio se vuelven espacios.
  const titulo = valor.replace(/\s*[\r\n]+\s*/g, " ").trim();
  if (titulo.length === 0) {
    return fallo({ codigo: "titulo-vacio", mensaje: "Escribe un título para la tarea.", campo: "titulo" });
  }
  if (longitud(titulo) > LIMITES_TAREA.tituloMaximo) {
    return fallo({
      codigo: "titulo-largo",
      mensaje: `El título admite hasta ${LIMITES_TAREA.tituloMaximo} caracteres.`,
      campo: "titulo",
    });
  }
  return exito(titulo);
}

export function validarDescripcion(valor: string | null): Resultado<string | null> {
  if (valor === null) return exito(null);
  const descripcion = valor.trim();
  if (descripcion.length === 0) return exito(null);
  if (longitud(descripcion) > LIMITES_TAREA.descripcionMaxima) {
    return fallo({
      codigo: "descripcion-larga",
      mensaje: `La descripción admite hasta ${LIMITES_TAREA.descripcionMaxima} caracteres.`,
      campo: "descripcion",
    });
  }
  return exito(descripcion);
}

export function validarVencimiento(
  fecha: FechaLocal | null,
  hora: HoraLocal | null,
): Resultado<{ fecha: FechaLocal | null; hora: HoraLocal | null }> {
  if (fecha !== null && !esFechaValida(fecha)) {
    return fallo({ codigo: "fecha-invalida", mensaje: "La fecha no es válida.", campo: "fechaVencimiento" });
  }
  if (hora !== null && !esHoraValida(hora)) {
    return fallo({ codigo: "hora-invalida", mensaje: "La hora no es válida.", campo: "horaVencimiento" });
  }
  if (fecha === null && hora !== null) {
    return fallo({
      codigo: "hora-sin-fecha",
      mensaje: "Elige una fecha antes de asignar una hora.",
      campo: "horaVencimiento",
    });
  }
  return exito({ fecha, hora });
}

/** Construye una tarea nueva a partir del único dato obligatorio: el título. */
export function crearTarea(datos: NuevaTarea, instante: Instante): Resultado<Tarea> {
  if (!esIdValido(datos.id)) {
    return fallo({ codigo: "id-invalido", mensaje: "El identificador de la tarea no es válido." });
  }
  const titulo = validarTitulo(datos.titulo);
  if (!titulo.ok) return titulo;
  return exito({
    id: datos.id,
    titulo: titulo.valor,
    descripcion: null,
    fechaVencimiento: null,
    horaVencimiento: null,
    completada: false,
    completadaEn: null,
    etiquetaIds: [],
    creadaEn: instante,
    actualizadaEn: instante,
  });
}

export interface ContextoCambios {
  etiquetasExistentes: ReadonlySet<string>;
  instante: Instante;
}

/**
 * Aplica cambios parciales respetando todas las reglas:
 * quitar la fecha quita también la hora; completar registra el instante;
 * las etiquetas deben existir y no se repiten.
 */
export function aplicarCambios(tarea: Tarea, cambios: CambiosTarea, contexto: ContextoCambios): Resultado<Tarea> {
  const siguiente: Tarea = { ...tarea, etiquetaIds: [...tarea.etiquetaIds] };

  if (cambios.titulo !== undefined) {
    const titulo = validarTitulo(cambios.titulo);
    if (!titulo.ok) return titulo;
    siguiente.titulo = titulo.valor;
  }

  if (cambios.descripcion !== undefined) {
    const descripcion = validarDescripcion(cambios.descripcion);
    if (!descripcion.ok) return descripcion;
    siguiente.descripcion = descripcion.valor;
  }

  if (cambios.fechaVencimiento !== undefined || cambios.horaVencimiento !== undefined) {
    const fecha = cambios.fechaVencimiento !== undefined ? cambios.fechaVencimiento : tarea.fechaVencimiento;
    let hora = cambios.horaVencimiento !== undefined ? cambios.horaVencimiento : tarea.horaVencimiento;
    // Quitar la fecha arrastra la hora, salvo que se intente fijar una hora explícitamente.
    if (fecha === null && cambios.horaVencimiento === undefined) hora = null;
    const vencimiento = validarVencimiento(fecha, hora);
    if (!vencimiento.ok) return vencimiento;
    siguiente.fechaVencimiento = vencimiento.valor.fecha;
    siguiente.horaVencimiento = vencimiento.valor.hora;
  }

  if (cambios.completada !== undefined && cambios.completada !== tarea.completada) {
    siguiente.completada = cambios.completada;
    siguiente.completadaEn = cambios.completada ? contexto.instante : null;
  }

  if (cambios.etiquetaIds !== undefined) {
    const etiquetas = normalizarEtiquetaIds(cambios.etiquetaIds, contexto.etiquetasExistentes);
    if (!etiquetas.ok) return etiquetas;
    siguiente.etiquetaIds = etiquetas.valor;
  }

  siguiente.actualizadaEn = contexto.instante;
  return exito(siguiente);
}
