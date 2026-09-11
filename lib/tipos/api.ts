import type { CambiosEtiqueta, Etiqueta, NuevaEtiqueta } from "./etiqueta";
import type { ErrorDominio } from "./resultado";
import type { CambiosTarea, NuevaTarea, Tarea } from "./tarea";
import type { Credenciales, Usuario } from "./usuario";

/**
 * Contratos HTTP de `app/api`. Los comparten el servidor, el cliente web y,
 * en el futuro, un cliente React Native.
 */
export interface RespuestaError {
  error: ErrorDominio;
}

export type SolicitudCrearTarea = NuevaTarea;
export type SolicitudActualizarTarea = CambiosTarea;
export interface RespuestaTarea {
  tarea: Tarea;
}
export interface RespuestaTareas {
  tareas: Tarea[];
}

export type SolicitudCrearEtiqueta = NuevaEtiqueta;
export type SolicitudActualizarEtiqueta = CambiosEtiqueta;
export interface RespuestaEtiqueta {
  etiqueta: Etiqueta;
}
export interface RespuestaEtiquetas {
  etiquetas: Etiqueta[];
}

export type SolicitudSesion = Credenciales;
export interface RespuestaSesion {
  usuario: Usuario;
}
export interface RespuestaRegistro {
  usuario: Usuario;
  requiereConfirmacion: boolean;
}

export type FormatoExportacion = "json" | "csv";
