/*
 * Siembra datos de demostración en Supabase para una cuenta.
 * Usa la service role key: se ejecuta solo en tu máquina, nunca en el navegador.
 *
 *   npm run sembrar:supabase -- demo@kairo.app una-contrasena
 *
 * Crea la cuenta (confirmada) si no existe y reemplaza sus tareas y etiquetas
 * por los datos de demostración, con fechas relativas al día de hoy.
 */
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { generarDatosDemostracion } from "../lib/dominio/demostracion";
import { momentoLocalDesde } from "../lib/dominio/fecha-local";

async function principal() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !claveServicio) {
    throw new Error("Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (en .env.local o en el entorno).");
  }
  const [correo = "demo@kairo.app", contrasena = "kairo-demo"] = process.argv.slice(2);
  const admin = createClient(url, claveServicio, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: lista, error: errorLista } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (errorLista) throw errorLista;
  let usuarioId = lista.users.find((usuario) => usuario.email === correo)?.id;
  if (!usuarioId) {
    const { data, error } = await admin.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("No se pudo crear la cuenta.");
    usuarioId = data.user.id;
    console.log(`Cuenta creada: ${correo}`);
  }

  // La service role omite RLS: se filtra explícitamente por usuario.
  for (const tabla of ["tareas", "etiquetas"] as const) {
    const { error } = await admin.from(tabla).delete().eq("usuario_id", usuarioId);
    if (error) throw error;
  }

  const ahora = new Date();
  const { tareas, etiquetas } = generarDatosDemostracion(momentoLocalDesde(ahora).fecha, ahora.toISOString(), randomUUID);

  const insertar = async (tabla: string, filas: Record<string, unknown>[]) => {
    if (filas.length === 0) return;
    const { error } = await admin.from(tabla).insert(filas);
    if (error) throw error;
  };

  await insertar(
    "etiquetas",
    etiquetas.map((etiqueta) => ({
      id: etiqueta.id,
      usuario_id: usuarioId,
      nombre: etiqueta.nombre,
      color: etiqueta.color,
      creada_en: etiqueta.creadaEn,
    })),
  );
  await insertar(
    "tareas",
    tareas.map((tarea) => ({
      id: tarea.id,
      usuario_id: usuarioId,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fecha_vencimiento: tarea.fechaVencimiento,
      hora_vencimiento: tarea.horaVencimiento,
      completada: tarea.completada,
      completada_en: tarea.completadaEn,
      creada_en: tarea.creadaEn,
      actualizada_en: tarea.actualizadaEn,
    })),
  );
  await insertar(
    "tareas_etiquetas",
    tareas.flatMap((tarea) =>
      tarea.etiquetaIds.map((etiquetaId, posicion) => ({
        tarea_id: tarea.id,
        etiqueta_id: etiquetaId,
        usuario_id: usuarioId,
        asignada_en: new Date(ahora.getTime() + posicion).toISOString(),
      })),
    ),
  );

  console.log(`Sembradas ${tareas.length} tareas y ${etiquetas.length} etiquetas para ${correo}.`);
}

principal().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
