import { contextoServidor } from "@/lib/adaptadores/contexto-servidor";
import type { RespuestaSesion } from "@/lib/tipos/api";
import { leerCredenciales } from "../_http/contratos";
import { leerJson, responderError, responderResultado, solicitudInvalida } from "../_http/respuestas";

const ERROR_SERVIDOR = { codigo: "error-servidor", mensaje: "No se pudo conectar. Inténtalo de nuevo en un momento." } as const;

/** Inicia sesión. La cookie de sesión la establece el adaptador de autenticación. */
export async function POST(peticion: Request): Promise<Response> {
  const credenciales = leerCredenciales(await leerJson(peticion));
  if (!credenciales) return solicitudInvalida();
  try {
    const { autenticacion } = await contextoServidor();
    const resultado = await autenticacion.iniciarSesion(credenciales);
    return responderResultado(resultado, (usuario): RespuestaSesion => ({ usuario }));
  } catch (error) {
    console.error("[kairo] error al iniciar sesión", error);
    return responderError(ERROR_SERVIDOR);
  }
}

export async function DELETE(): Promise<Response> {
  try {
    const { autenticacion } = await contextoServidor();
    await autenticacion.cerrarSesion();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[kairo] error al cerrar sesión", error);
    return responderError(ERROR_SERVIDOR);
  }
}
