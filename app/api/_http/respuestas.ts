import { contextoServidor, type Repositorios } from "@/lib/adaptadores/contexto-servidor";
import type { RespuestaError } from "@/lib/tipos/api";
import type { CodigoError, ErrorDominio, Resultado } from "@/lib/tipos/resultado";
import type { Usuario } from "@/lib/tipos/usuario";

const ESTADO_POR_CODIGO: Partial<Record<CodigoError, number>> = {
  "no-encontrado": 404,
  "no-autenticado": 401,
  "credenciales-invalidas": 401,
  "correo-registrado": 409,
  "nombre-etiqueta-duplicado": 409,
  "error-servidor": 500,
};

const SIN_CACHE = { "Cache-Control": "private, no-store" };

export function responderJson<T>(cuerpo: T, estado = 200): Response {
  return Response.json(cuerpo, { status: estado, headers: SIN_CACHE });
}

export function responderError(error: ErrorDominio): Response {
  const cuerpo: RespuestaError = { error };
  return Response.json(cuerpo, { status: ESTADO_POR_CODIGO[error.codigo] ?? 422, headers: SIN_CACHE });
}

export function responderResultado<T, C>(resultado: Resultado<T>, empaquetar: (valor: T) => C, estado = 200): Response {
  return resultado.ok ? responderJson(empaquetar(resultado.valor), estado) : responderError(resultado.error);
}

export function solicitudInvalida(mensaje = "La solicitud no tiene el formato esperado."): Response {
  return responderError({ codigo: "solicitud-invalida", mensaje });
}

export async function leerJson(peticion: Request): Promise<unknown> {
  try {
    return await peticion.json();
  } catch {
    return undefined;
  }
}

interface ContextoAutenticado {
  usuario: Usuario;
  repositorios: Repositorios;
  reloj: () => Date;
}

/**
 * Orquestación común: resuelve el usuario de la sesión y sus repositorios.
 * Cualquier fallo inesperado se convierte en un 500 con mensaje accionable.
 */
export async function conUsuario(accion: (contexto: ContextoAutenticado) => Promise<Response>): Promise<Response> {
  try {
    const contexto = await contextoServidor();
    const usuario = await contexto.autenticacion.usuarioActual();
    if (!usuario) {
      return responderError({ codigo: "no-autenticado", mensaje: "Tu sesión terminó. Vuelve a iniciar sesión." });
    }
    return await accion({ usuario, repositorios: contexto.repositorios(usuario), reloj: () => new Date() });
  } catch (error) {
    console.error("[kairo] error en API", error);
    return responderError({ codigo: "error-servidor", mensaje: "Algo falló en el servidor. Inténtalo de nuevo en un momento." });
  }
}
