import { crearServicioTareas } from "@/lib/servicios/servicio-tareas";
import type { RespuestaTarea, RespuestaTareas } from "@/lib/tipos/api";
import { leerCrearTarea } from "../_http/contratos";
import { conUsuario, leerJson, responderJson, responderResultado, solicitudInvalida } from "../_http/respuestas";

export function GET(): Promise<Response> {
  return conUsuario(async ({ repositorios, reloj }) => {
    const tareas = await crearServicioTareas({ ...repositorios, reloj }).listar();
    return responderJson<RespuestaTareas>({ tareas });
  });
}

export function POST(peticion: Request): Promise<Response> {
  return conUsuario(async ({ repositorios, reloj }) => {
    const datos = leerCrearTarea(await leerJson(peticion));
    if (!datos) return solicitudInvalida();
    const resultado = await crearServicioTareas({ ...repositorios, reloj }).crear(datos);
    return responderResultado(resultado, (tarea): RespuestaTarea => ({ tarea }), 201);
  });
}
