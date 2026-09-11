import { esIdValido } from "@/lib/dominio/texto";
import { crearServicioEtiquetas } from "@/lib/servicios/servicio-etiquetas";
import type { RespuestaEtiqueta } from "@/lib/tipos/api";
import { leerActualizarEtiqueta } from "../../_http/contratos";
import { conUsuario, leerJson, responderError, responderResultado, solicitudInvalida } from "../../_http/respuestas";

interface Parametros {
  params: Promise<{ id: string }>;
}

const NO_ENCONTRADA = { codigo: "no-encontrado", mensaje: "La etiqueta ya no existe." } as const;

export async function PATCH(peticion: Request, { params }: Parametros): Promise<Response> {
  const { id } = await params;
  if (!esIdValido(id)) return responderError(NO_ENCONTRADA);
  return conUsuario(async ({ repositorios, reloj }) => {
    const cambios = leerActualizarEtiqueta(await leerJson(peticion));
    if (!cambios) return solicitudInvalida();
    const resultado = await crearServicioEtiquetas({ etiquetas: repositorios.etiquetas, reloj }).actualizar(id, cambios);
    return responderResultado(resultado, (etiqueta): RespuestaEtiqueta => ({ etiqueta }));
  });
}

/** Elimina la etiqueta y sus relaciones. Las tareas no se tocan. */
export async function DELETE(_peticion: Request, { params }: Parametros): Promise<Response> {
  const { id } = await params;
  if (!esIdValido(id)) return responderError(NO_ENCONTRADA);
  return conUsuario(async ({ repositorios, reloj }) => {
    const resultado = await crearServicioEtiquetas({ etiquetas: repositorios.etiquetas, reloj }).eliminar(id);
    return resultado.ok ? new Response(null, { status: 204 }) : responderError(resultado.error);
  });
}
