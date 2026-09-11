import { esColorEtiqueta } from "@/lib/dominio/etiquetas";
import type {
  SolicitudActualizarEtiqueta,
  SolicitudActualizarTarea,
  SolicitudCrearEtiqueta,
  SolicitudCrearTarea,
  SolicitudSesion,
} from "@/lib/tipos/api";

/*
 * Lectura de cuerpos HTTP desconocidos a contratos tipados.
 * Solo se comprueba la forma; las reglas de negocio las valida el dominio.
 */

type Objeto = Record<string, unknown>;

function esObjeto(valor: unknown): valor is Objeto {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

const esTexto = (valor: unknown): valor is string => typeof valor === "string";
const esTextoONulo = (valor: unknown): valor is string | null => valor === null || typeof valor === "string";

export function leerCrearTarea(cuerpo: unknown): SolicitudCrearTarea | null {
  if (!esObjeto(cuerpo) || !esTexto(cuerpo.id) || !esTexto(cuerpo.titulo)) return null;
  return { id: cuerpo.id, titulo: cuerpo.titulo };
}

export function leerActualizarTarea(cuerpo: unknown): SolicitudActualizarTarea | null {
  if (!esObjeto(cuerpo)) return null;
  const cambios: SolicitudActualizarTarea = {};
  if ("titulo" in cuerpo) {
    if (!esTexto(cuerpo.titulo)) return null;
    cambios.titulo = cuerpo.titulo;
  }
  if ("descripcion" in cuerpo) {
    if (!esTextoONulo(cuerpo.descripcion)) return null;
    cambios.descripcion = cuerpo.descripcion;
  }
  if ("fechaVencimiento" in cuerpo) {
    if (!esTextoONulo(cuerpo.fechaVencimiento)) return null;
    cambios.fechaVencimiento = cuerpo.fechaVencimiento;
  }
  if ("horaVencimiento" in cuerpo) {
    if (!esTextoONulo(cuerpo.horaVencimiento)) return null;
    cambios.horaVencimiento = cuerpo.horaVencimiento;
  }
  if ("completada" in cuerpo) {
    if (typeof cuerpo.completada !== "boolean") return null;
    cambios.completada = cuerpo.completada;
  }
  if ("etiquetaIds" in cuerpo) {
    if (!Array.isArray(cuerpo.etiquetaIds) || !cuerpo.etiquetaIds.every(esTexto)) return null;
    cambios.etiquetaIds = cuerpo.etiquetaIds;
  }
  return cambios;
}

export function leerCrearEtiqueta(cuerpo: unknown): SolicitudCrearEtiqueta | null {
  if (!esObjeto(cuerpo) || !esTexto(cuerpo.id) || !esTexto(cuerpo.nombre)) return null;
  if (cuerpo.color !== undefined && !esColorEtiqueta(cuerpo.color)) return null;
  return { id: cuerpo.id, nombre: cuerpo.nombre, ...(cuerpo.color !== undefined ? { color: cuerpo.color } : {}) };
}

export function leerActualizarEtiqueta(cuerpo: unknown): SolicitudActualizarEtiqueta | null {
  if (!esObjeto(cuerpo)) return null;
  const cambios: SolicitudActualizarEtiqueta = {};
  if ("nombre" in cuerpo) {
    if (!esTexto(cuerpo.nombre)) return null;
    cambios.nombre = cuerpo.nombre;
  }
  if ("color" in cuerpo) {
    if (!esColorEtiqueta(cuerpo.color)) return null;
    cambios.color = cuerpo.color;
  }
  return cambios;
}

export function leerCredenciales(cuerpo: unknown): SolicitudSesion | null {
  if (!esObjeto(cuerpo) || !esTexto(cuerpo.correo) || !esTexto(cuerpo.contrasena)) return null;
  return { correo: cuerpo.correo, contrasena: cuerpo.contrasena };
}
