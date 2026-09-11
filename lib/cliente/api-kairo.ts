import type {
  FormatoExportacion,
  RespuestaEtiqueta,
  RespuestaRegistro,
  RespuestaSesion,
  RespuestaTarea,
  SolicitudActualizarEtiqueta,
  SolicitudActualizarTarea,
  SolicitudCrearEtiqueta,
  SolicitudCrearTarea,
} from "@/lib/tipos/api";
import type { Etiqueta } from "@/lib/tipos/etiqueta";
import { exito, fallo, type ErrorDominio, type Resultado } from "@/lib/tipos/resultado";
import type { FechaLocal, Tarea } from "@/lib/tipos/tarea";
import type { Credenciales, Usuario } from "@/lib/tipos/usuario";

/*
 * Cliente HTTP de la API de Kairo. Solo usa `fetch`, disponible también en React Native.
 * `estado` es null cuando no hubo respuesta (sin conexión).
 */

export interface ErrorCliente extends ErrorDominio {
  estado: number | null;
}

const SIN_CONEXION: ErrorCliente = {
  codigo: "error-servidor",
  mensaje: "No hay conexión con el servidor. Revisa tu red y vuelve a intentarlo.",
  estado: null,
};

export interface OpcionesCliente {
  base?: string;
}

async function leerError(respuesta: Response): Promise<ErrorCliente> {
  try {
    const cuerpo = (await respuesta.json()) as { error?: ErrorDominio };
    if (cuerpo.error) return { ...cuerpo.error, estado: respuesta.status };
  } catch {
    // Respuesta sin JSON.
  }
  return { codigo: "error-servidor", mensaje: "Algo falló en el servidor. Inténtalo de nuevo.", estado: respuesta.status };
}

export function crearClienteKairo({ base = "" }: OpcionesCliente = {}) {
  async function solicitar<T>(ruta: string, metodo: string, cuerpo?: unknown): Promise<Resultado<T, ErrorCliente>> {
    let respuesta: Response;
    try {
      respuesta = await fetch(`${base}${ruta}`, {
        method: metodo,
        headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        credentials: "same-origin",
      });
    } catch {
      return fallo(SIN_CONEXION);
    }
    if (!respuesta.ok) return fallo(await leerError(respuesta));
    if (respuesta.status === 204) return exito(null as T);
    return exito((await respuesta.json()) as T);
  }

  const desempaquetar = async <T, C>(promesa: Promise<Resultado<C, ErrorCliente>>, extraer: (cuerpo: C) => T) => {
    const resultado = await promesa;
    return resultado.ok ? exito(extraer(resultado.valor)) : resultado;
  };

  return {
    crearTarea: (datos: SolicitudCrearTarea): Promise<Resultado<Tarea, ErrorCliente>> =>
      desempaquetar(solicitar<RespuestaTarea>("/api/tareas", "POST", datos), (c) => c.tarea),
    actualizarTarea: (id: string, cambios: SolicitudActualizarTarea): Promise<Resultado<Tarea, ErrorCliente>> =>
      desempaquetar(solicitar<RespuestaTarea>(`/api/tareas/${id}`, "PATCH", cambios), (c) => c.tarea),
    eliminarTarea: (id: string) => solicitar<null>(`/api/tareas/${id}`, "DELETE"),

    crearEtiqueta: (datos: SolicitudCrearEtiqueta): Promise<Resultado<Etiqueta, ErrorCliente>> =>
      desempaquetar(solicitar<RespuestaEtiqueta>("/api/etiquetas", "POST", datos), (c) => c.etiqueta),
    actualizarEtiqueta: (id: string, cambios: SolicitudActualizarEtiqueta): Promise<Resultado<Etiqueta, ErrorCliente>> =>
      desempaquetar(solicitar<RespuestaEtiqueta>(`/api/etiquetas/${id}`, "PATCH", cambios), (c) => c.etiqueta),
    eliminarEtiqueta: (id: string) => solicitar<null>(`/api/etiquetas/${id}`, "DELETE"),

    iniciarSesion: (credenciales: Credenciales): Promise<Resultado<Usuario, ErrorCliente>> =>
      desempaquetar(solicitar<RespuestaSesion>("/api/sesion", "POST", credenciales), (c) => c.usuario),
    registrar: (credenciales: Credenciales) => solicitar<RespuestaRegistro>("/api/registro", "POST", credenciales),
    cerrarSesion: () => solicitar<null>("/api/sesion", "DELETE"),

    /** Descarga el contenido exportado. Qué hacer con él lo decide la plataforma. */
    async exportar(formato: FormatoExportacion, fecha: FechaLocal): Promise<Resultado<Blob, ErrorCliente>> {
      try {
        const respuesta = await fetch(`${base}/api/exportar?formato=${formato}&fecha=${fecha}`, { credentials: "same-origin" });
        if (!respuesta.ok) return fallo(await leerError(respuesta));
        return exito(await respuesta.blob());
      } catch {
        return fallo(SIN_CONEXION);
      }
    },
  };
}

export type ClienteKairo = ReturnType<typeof crearClienteKairo>;
