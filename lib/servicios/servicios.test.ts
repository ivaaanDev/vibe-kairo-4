import { beforeEach, describe, expect, it } from "vitest";
import {
  crearAlmacenEnMemoria,
  crearRepositorioEtiquetas,
  crearRepositorioTareas,
} from "@/lib/adaptadores/memoria/repositorios-memoria";
import { idDePrueba } from "@/lib/dominio/pruebas/fabricas";
import { crearServicioEtiquetas } from "./servicio-etiquetas";
import { crearServicioExportacion } from "./servicio-exportacion";
import { crearServicioTareas } from "./servicio-tareas";

function montar() {
  const almacen = crearAlmacenEnMemoria();
  const deps = {
    tareas: crearRepositorioTareas(almacen),
    etiquetas: crearRepositorioEtiquetas(almacen),
    reloj: () => new Date("2026-09-10T12:00:00.000Z"),
  };
  return {
    tareas: crearServicioTareas(deps),
    etiquetas: crearServicioEtiquetas(deps),
    exportacion: crearServicioExportacion(deps),
  };
}

describe("servicios", () => {
  let s: ReturnType<typeof montar>;
  beforeEach(() => {
    s = montar();
  });

  it("crea una tarea solo con título y la persiste", async () => {
    const creada = await s.tareas.crear({ id: idDePrueba(), titulo: "  Llamar al banco " });
    expect(creada).toMatchObject({ ok: true, valor: { titulo: "Llamar al banco" } });
    expect(await s.tareas.listar()).toHaveLength(1);
  });

  it("no persiste una tarea inválida", async () => {
    const creada = await s.tareas.crear({ id: idDePrueba(), titulo: "" });
    expect(creada.ok).toBe(false);
    expect(await s.tareas.listar()).toHaveLength(0);
  });

  it("edita, completa y revierte", async () => {
    const id = idDePrueba();
    await s.tareas.crear({ id, titulo: "Informe" });
    expect(await s.tareas.actualizar(id, { fechaVencimiento: "2026-09-12", horaVencimiento: "10:00" })).toMatchObject({
      ok: true,
      valor: { fechaVencimiento: "2026-09-12", horaVencimiento: "10:00" },
    });
    expect(await s.tareas.actualizar(id, { completada: true })).toMatchObject({ ok: true, valor: { completada: true } });
    expect(await s.tareas.actualizar(id, { completada: false })).toMatchObject({ ok: true, valor: { completada: false } });
  });

  it("responde no encontrado para ids ajenos o eliminados", async () => {
    const id = idDePrueba();
    expect(await s.tareas.actualizar(id, { titulo: "x" })).toMatchObject({ ok: false, error: { codigo: "no-encontrado" } });
    expect(await s.tareas.eliminar(id)).toMatchObject({ ok: false, error: { codigo: "no-encontrado" } });
  });

  it("eliminar una etiqueta nunca elimina sus tareas", async () => {
    const tareaId = idDePrueba();
    const etiquetaId = idDePrueba();
    await s.tareas.crear({ id: tareaId, titulo: "Con etiqueta" });
    await s.etiquetas.crear({ id: etiquetaId, nombre: "Casa" });
    await s.tareas.actualizar(tareaId, { etiquetaIds: [etiquetaId] });

    expect(await s.etiquetas.eliminar(etiquetaId)).toEqual({ ok: true, valor: null });
    const tareas = await s.tareas.listar();
    expect(tareas).toHaveLength(1);
    expect(tareas[0]?.etiquetaIds).toEqual([]);
  });

  it("renombra etiquetas validando duplicados", async () => {
    const a = idDePrueba();
    await s.etiquetas.crear({ id: a, nombre: "Casa" });
    await s.etiquetas.crear({ id: idDePrueba(), nombre: "Trabajo" });
    expect(await s.etiquetas.actualizar(a, { nombre: "trabajo" })).toMatchObject({ ok: false });
    expect(await s.etiquetas.actualizar(a, { nombre: "Hogar", color: "teja" })).toMatchObject({
      ok: true,
      valor: { nombre: "Hogar", color: "teja" },
    });
  });

  it("exporta todas las tareas en ambos formatos", async () => {
    for (const titulo of ["Uno", "Dos", "Tres"]) await s.tareas.crear({ id: idDePrueba(), titulo });
    const json = await s.exportacion.exportar("json", "2026-09-10");
    expect(json.nombre).toBe("kairo-tareas-2026-09-10.json");
    expect(JSON.parse(json.contenido).tareas).toHaveLength(3);
    const csv = await s.exportacion.exportar("csv", "2026-09-10");
    expect(csv.contenido.trim().split("\r\n")).toHaveLength(4);
  });
});
