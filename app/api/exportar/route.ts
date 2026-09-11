import { esFechaValida, momentoLocalDesde } from "@/lib/dominio/fecha-local";
import { crearServicioExportacion } from "@/lib/servicios/servicio-exportacion";
import { conUsuario, solicitudInvalida } from "../_http/respuestas";

/**
 * GET /api/exportar?formato=json|csv&fecha=YYYY-MM-DD
 * `fecha` es la fecha local del usuario, solo para nombrar el archivo.
 * Siempre incluye todas las tareas y etiquetas, ignorando cualquier filtro de la interfaz.
 */
export function GET(peticion: Request): Promise<Response> {
  return conUsuario(async ({ repositorios, reloj }) => {
    const parametros = new URL(peticion.url).searchParams;
    const formato = parametros.get("formato");
    if (formato !== "json" && formato !== "csv") return solicitudInvalida("Formato no admitido. Usa json o csv.");
    const fechaSolicitada = parametros.get("fecha");
    const fecha = fechaSolicitada && esFechaValida(fechaSolicitada) ? fechaSolicitada : momentoLocalDesde(reloj()).fecha;

    const archivo = await crearServicioExportacion({ ...repositorios, reloj }).exportar(formato, fecha);
    return new Response(archivo.contenido, {
      headers: {
        "Content-Type": archivo.tipoMime,
        "Content-Disposition": `attachment; filename="${archivo.nombre}"`,
        "Cache-Control": "private, no-store",
      },
    });
  });
}
