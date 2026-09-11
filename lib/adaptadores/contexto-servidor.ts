import { cookies } from "next/headers";
import type { AlmacenCookies } from "@/lib/adaptadores/cookies";
import { crearAutenticacionLocal, prepararBaseLocal } from "@/lib/adaptadores/local/autenticacion-local";
import { almacenDeUsuario } from "@/lib/adaptadores/local/base-local";
import { crearRepositorioEtiquetas, crearRepositorioTareas } from "@/lib/adaptadores/memoria/repositorios-memoria";
import { crearAutenticacionSupabase } from "@/lib/adaptadores/supabase/autenticacion-supabase";
import { crearClienteSupabase } from "@/lib/adaptadores/supabase/cliente-servidor";
import {
  crearRepositorioEtiquetasSupabase,
  crearRepositorioTareasSupabase,
} from "@/lib/adaptadores/supabase/repositorios-supabase";
import type { AdaptadorAutenticacion, RepositorioEtiquetas, RepositorioTareas } from "@/lib/tipos/puertos";
import type { Usuario } from "@/lib/tipos/usuario";

export type NombreAdaptador = "supabase" | "local";

export function adaptadorConfigurado(): NombreAdaptador {
  const nombre = process.env.KAIRO_ADAPTADOR === "local" ? "local" : "supabase";
  if (nombre === "local" && process.env.NODE_ENV === "production" && process.env.KAIRO_PERMITIR_LOCAL !== "1") {
    throw new Error("El adaptador local es solo para desarrollo. Configura Supabase para producción.");
  }
  return nombre;
}

export interface Repositorios {
  tareas: RepositorioTareas;
  etiquetas: RepositorioEtiquetas;
}

export interface ContextoServidor {
  adaptador: NombreAdaptador;
  autenticacion: AdaptadorAutenticacion;
  /** Repositorios limitados al usuario autenticado. */
  repositorios(usuario: Usuario): Repositorios;
}

/** Envuelve el cookie store de Next. En Server Components escribir cookies no está permitido y se ignora. */
async function cookiesDePeticion(): Promise<AlmacenCookies> {
  const almacen = await cookies();
  const intentar = (accion: () => void) => {
    try {
      accion();
    } catch {
      // Llamado desde un Server Component: el proxy se encarga de refrescar la sesión.
    }
  };
  return {
    todas: () => almacen.getAll().map(({ name, value }) => ({ name, value })),
    obtener: (nombre) => almacen.get(nombre)?.value,
    establecer: (nombre, valor, opciones) => intentar(() => almacen.set(nombre, valor, opciones)),
    eliminar: (nombre) => intentar(() => almacen.delete(nombre)),
  };
}

export async function contextoServidor(): Promise<ContextoServidor> {
  const adaptador = adaptadorConfigurado();
  const almacenCookies = await cookiesDePeticion();

  if (adaptador === "local") {
    prepararBaseLocal();
    return {
      adaptador,
      autenticacion: crearAutenticacionLocal(almacenCookies),
      repositorios(usuario) {
        const almacen = almacenDeUsuario(usuario.id);
        return { tareas: crearRepositorioTareas(almacen), etiquetas: crearRepositorioEtiquetas(almacen) };
      },
    };
  }

  const cliente = crearClienteSupabase(almacenCookies);
  return {
    adaptador,
    autenticacion: crearAutenticacionSupabase(cliente),
    repositorios: () => ({
      tareas: crearRepositorioTareasSupabase(cliente),
      etiquetas: crearRepositorioEtiquetasSupabase(cliente),
    }),
  };
}
