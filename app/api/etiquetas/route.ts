import { crearServicioEtiquetas } from "@/lib/servicios/servicio-etiquetas";
import type { RespuestaEtiqueta, RespuestaEtiquetas } from "@/lib/tipos/api";
import { leerCrearEtiqueta } from "../_http/contratos";
import { conUsuario, leerJson, responderJson, responderResultado, solicitudInvalida } from "../_http/respuestas";

export function GET(): Promise<Response> {
  return conUsuario(async ({ repositorios, reloj }) => {
    const etiquetas = await crearServicioEtiquetas({ etiquetas: repositorios.etiquetas, reloj }).listar();
    return responderJson<RespuestaEtiquetas>({ etiquetas });
  });
}

export function POST(peticion: Request): Promise<Response> {
  return conUsuario(async ({ repositorios, reloj }) => {
    const datos = leerCrearEtiqueta(await leerJson(peticion));
    if (!datos) return solicitudInvalida();
    const resultado = await crearServicioEtiquetas({ etiquetas: repositorios.etiquetas, reloj }).crear(datos);
    return responderResultado(resultado, (etiqueta): RespuestaEtiqueta => ({ etiqueta }), 201);
  });
}
