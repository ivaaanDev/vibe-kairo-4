import { contextoServidor } from "@/lib/adaptadores/contexto-servidor";
import type { RespuestaRegistro } from "@/lib/tipos/api";
import { leerCredenciales } from "../_http/contratos";
import { leerJson, responderError, responderResultado, solicitudInvalida } from "../_http/respuestas";

export async function POST(peticion: Request): Promise<Response> {
  const credenciales = leerCredenciales(await leerJson(peticion));
  if (!credenciales) return solicitudInvalida();
  try {
    const { autenticacion } = await contextoServidor();
    const resultado = await autenticacion.registrar(credenciales);
    return responderResultado(resultado, (registro): RespuestaRegistro => registro, 201);
  } catch (error) {
    console.error("[kairo] error al registrar", error);
    return responderError({ codigo: "error-servidor", mensaje: "No se pudo crear la cuenta. Inténtalo de nuevo en un momento." });
  }
}
