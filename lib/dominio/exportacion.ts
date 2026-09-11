import type { FormatoExportacion } from "@/lib/tipos/api";
import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { FechaLocal, Instante, Tarea } from "@/lib/tipos/tarea";
import { etiquetasDeTarea, ordenarEtiquetas } from "./etiquetas";

/*
 * La exportación se genera como texto puro. Cómo llega al usuario
 * (descarga en el navegador, hoja de compartir en móvil) es asunto de la plataforma.
 */

export interface TareaExportada {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: FechaLocal | null;
  horaVencimiento: string | null;
  completada: boolean;
  completadaEn: Instante | null;
  creadaEn: Instante;
  actualizadaEn: Instante;
  etiquetas: { id: string; nombre: string; color: string }[];
}

export interface DocumentoExportacion {
  formato: "kairo.exportacion";
  version: 1;
  exportadoEn: Instante;
  etiquetas: { id: string; nombre: string; color: string; creadaEn: Instante }[];
  tareas: TareaExportada[];
}

/** Incluye el 100 % de las tareas y etiquetas recibidas, sin filtros. */
export function construirExportacion(
  tareas: readonly Tarea[],
  etiquetas: readonly Etiqueta[],
  instante: Instante,
): DocumentoExportacion {
  const porId = new Map(etiquetas.map((etiqueta) => [etiqueta.id, etiqueta]));
  const ordenadas = [...tareas].sort((a, b) =>
    a.creadaEn === b.creadaEn ? (a.id < b.id ? -1 : 1) : a.creadaEn < b.creadaEn ? -1 : 1,
  );
  return {
    formato: "kairo.exportacion",
    version: 1,
    exportadoEn: instante,
    etiquetas: ordenarEtiquetas(etiquetas).map(({ id, nombre, color, creadaEn }) => ({ id, nombre, color, creadaEn })),
    tareas: ordenadas.map((tarea) => ({
      id: tarea.id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fechaVencimiento: tarea.fechaVencimiento,
      horaVencimiento: tarea.horaVencimiento,
      completada: tarea.completada,
      completadaEn: tarea.completadaEn,
      creadaEn: tarea.creadaEn,
      actualizadaEn: tarea.actualizadaEn,
      etiquetas: etiquetasDeTarea(tarea, porId).map(({ id, nombre, color }) => ({ id, nombre, color })),
    })),
  };
}

export function serializarJson(documento: DocumentoExportacion): string {
  return `${JSON.stringify(documento, null, 2)}\n`;
}

export const COLUMNAS_CSV = [
  "id",
  "titulo",
  "descripcion",
  "fecha_vencimiento",
  "hora_vencimiento",
  "completada",
  "completada_en",
  "etiquetas",
  "creada_en",
  "actualizada_en",
] as const;

/**
 * Celda CSV según RFC 4180. Las celdas que una hoja de cálculo interpretaría como
 * fórmula se prefijan con un apóstrofo (mitigación de inyección CSV).
 */
export function celdaCsv(valor: string | number | boolean | null): string {
  if (valor === null) return "";
  let texto = String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** CSV con BOM UTF-8 (para que Excel respete los acentos) y saltos CRLF. */
export function serializarCsv(documento: DocumentoExportacion): string {
  const filas = documento.tareas.map((tarea) =>
    [
      tarea.id,
      tarea.titulo,
      tarea.descripcion,
      tarea.fechaVencimiento,
      tarea.horaVencimiento,
      tarea.completada ? "si" : "no",
      tarea.completadaEn,
      tarea.etiquetas.map((etiqueta) => etiqueta.nombre).join("; "),
      tarea.creadaEn,
      tarea.actualizadaEn,
    ]
      .map(celdaCsv)
      .join(","),
  );
  return `\uFEFF${[COLUMNAS_CSV.join(","), ...filas].join("\r\n")}\r\n`;
}

export function serializarExportacion(documento: DocumentoExportacion, formato: FormatoExportacion): string {
  return formato === "json" ? serializarJson(documento) : serializarCsv(documento);
}

export function nombreArchivoExportacion(formato: FormatoExportacion, fecha: FechaLocal): string {
  return `kairo-tareas-${fecha}.${formato}`;
}

export function tipoMimeExportacion(formato: FormatoExportacion): string {
  return formato === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8";
}
