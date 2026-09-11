import type { SupabaseClient } from "@supabase/supabase-js";
import { esColorEtiqueta } from "@/lib/dominio/etiquetas";
import type { Etiqueta } from "@/lib/tipos/etiqueta";
import type { RepositorioEtiquetas, RepositorioTareas } from "@/lib/tipos/puertos";
import type { Tarea } from "@/lib/tipos/tarea";

/*
 * Repositorios sobre Supabase PostgreSQL. No filtran por usuario en el código:
 * la separación la garantiza Row Level Security con `auth.uid()`.
 */

interface FilaTarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  hora_vencimiento: string | null;
  completada: boolean;
  completada_en: string | null;
  creada_en: string;
  actualizada_en: string;
  tareas_etiquetas: { etiqueta_id: string; asignada_en: string }[] | null;
}

interface FilaEtiqueta {
  id: string;
  nombre: string;
  color: string;
  creada_en: string;
}

const COLUMNAS_TAREA =
  "id,titulo,descripcion,fecha_vencimiento,hora_vencimiento,completada,completada_en,creada_en,actualizada_en,tareas_etiquetas(etiqueta_id,asignada_en)";
const COLUMNAS_ETIQUETA = "id,nombre,color,creada_en";

function aTarea(fila: FilaTarea): Tarea {
  const relaciones = [...(fila.tareas_etiquetas ?? [])].sort((a, b) => (a.asignada_en < b.asignada_en ? -1 : 1));
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    fechaVencimiento: fila.fecha_vencimiento,
    // PostgreSQL devuelve `time` como HH:MM:SS.
    horaVencimiento: fila.hora_vencimiento ? fila.hora_vencimiento.slice(0, 5) : null,
    completada: fila.completada,
    completadaEn: fila.completada_en,
    etiquetaIds: relaciones.map((relacion) => relacion.etiqueta_id),
    creadaEn: fila.creada_en,
    actualizadaEn: fila.actualizada_en,
  };
}

function aEtiqueta(fila: FilaEtiqueta): Etiqueta {
  return { id: fila.id, nombre: fila.nombre, color: esColorEtiqueta(fila.color) ? fila.color : "grafito", creadaEn: fila.creada_en };
}

function comprobar(error: { message: string } | null): void {
  if (error) throw new Error(`Supabase: ${error.message}`);
}

export function crearRepositorioTareasSupabase(cliente: SupabaseClient): RepositorioTareas {
  const repositorio: RepositorioTareas = {
    async listar() {
      const { data, error } = await cliente.from("tareas").select(COLUMNAS_TAREA).returns<FilaTarea[]>();
      comprobar(error);
      return (data ?? []).map(aTarea);
    },

    async obtener(id) {
      const { data, error } = await cliente.from("tareas").select(COLUMNAS_TAREA).eq("id", id).maybeSingle<FilaTarea>();
      comprobar(error);
      return data ? aTarea(data) : null;
    },

    async insertar(tarea) {
      const { error } = await cliente.from("tareas").insert({
        id: tarea.id,
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        fecha_vencimiento: tarea.fechaVencimiento,
        hora_vencimiento: tarea.horaVencimiento,
        completada: tarea.completada,
        completada_en: tarea.completadaEn,
        creada_en: tarea.creadaEn,
        actualizada_en: tarea.actualizadaEn,
      });
      comprobar(error);
      return (await repositorio.obtener(tarea.id)) ?? tarea;
    },

    async guardar(tarea) {
      // Una sola transacción: actualiza la fila y reemplaza sus etiquetas.
      const { error } = await cliente.rpc("guardar_tarea", {
        p_id: tarea.id,
        p_titulo: tarea.titulo,
        p_descripcion: tarea.descripcion,
        p_fecha_vencimiento: tarea.fechaVencimiento,
        p_hora_vencimiento: tarea.horaVencimiento,
        p_completada: tarea.completada,
        p_completada_en: tarea.completadaEn,
        p_etiqueta_ids: tarea.etiquetaIds,
      });
      comprobar(error);
      return (await repositorio.obtener(tarea.id)) ?? tarea;
    },

    async eliminar(id) {
      const { data, error } = await cliente.from("tareas").delete().eq("id", id).select("id");
      comprobar(error);
      return (data ?? []).length > 0;
    },
  };
  return repositorio;
}

export function crearRepositorioEtiquetasSupabase(cliente: SupabaseClient): RepositorioEtiquetas {
  return {
    async listar() {
      const { data, error } = await cliente.from("etiquetas").select(COLUMNAS_ETIQUETA).returns<FilaEtiqueta[]>();
      comprobar(error);
      return (data ?? []).map(aEtiqueta);
    },

    async obtener(id) {
      const { data, error } = await cliente.from("etiquetas").select(COLUMNAS_ETIQUETA).eq("id", id).maybeSingle<FilaEtiqueta>();
      comprobar(error);
      return data ? aEtiqueta(data) : null;
    },

    async insertar(etiqueta) {
      const { data, error } = await cliente
        .from("etiquetas")
        .insert({ id: etiqueta.id, nombre: etiqueta.nombre, color: etiqueta.color, creada_en: etiqueta.creadaEn })
        .select(COLUMNAS_ETIQUETA)
        .single<FilaEtiqueta>();
      comprobar(error);
      return data ? aEtiqueta(data) : etiqueta;
    },

    async guardar(etiqueta) {
      const { data, error } = await cliente
        .from("etiquetas")
        .update({ nombre: etiqueta.nombre, color: etiqueta.color })
        .eq("id", etiqueta.id)
        .select(COLUMNAS_ETIQUETA)
        .single<FilaEtiqueta>();
      comprobar(error);
      return data ? aEtiqueta(data) : etiqueta;
    },

    async eliminar(id) {
      // ON DELETE CASCADE en tareas_etiquetas: desaparece la relación, las tareas permanecen.
      const { data, error } = await cliente.from("etiquetas").delete().eq("id", id).select("id");
      comprobar(error);
      return (data ?? []).length > 0;
    },
  };
}
