import { esIdValido } from "@/lib/dominio/texto";
import { crearServicioTareas } from "@/lib/servicios/servicio-tareas";
import type { RespuestaTarea } from "@/lib/tipos/api";
import { leerActualizarTarea } from "../../_http/contratos";
import { conUsuario, leerJson, responderError, responderResultado, solicitudInvalida } from "../../_http/respuestas";

interface Parametros {
  params: Promise<{ id: string }>;
}

const NO_ENCONTRADA = { codigo: "no-encontrado", mensaje: "La tarea ya no existe." } as const;

export async function PATCH(peticion: Request, { params }: Parametros): Promise<Response> {
  const { id } = await params;
  if (!esIdValido(id)) return responderError(NO_ENCONTRADA);
  return conUsuario(async ({ repositorios, reloj }) => {
    const cambios = leerActualizarTarea(await leerJson(peticion));
    if (!cambios) return solicitudInvalida();
    const resultado = await crearServicioTareas({ ...repositorios, reloj }).actualizar(id, cambios);
    return responderResultado(resultado, (tarea): RespuestaTarea => ({ tarea }));
  });
}

export async function DELETE(_peticion: Request, { params }: Parametros): Promise<Response> {
  const { id } = await params;
  if (!esIdValido(id)) return responderError(NO_ENCONTRADA);
  return conUsuario(async ({ repositorios, reloj }) => {
    const resultado = await crearServicioTareas({ ...repositorios, reloj }).eliminar(id);
    return resultado.ok ? new Response(null, { status: 204 }) : responderError(resultado.error);
  });
}
